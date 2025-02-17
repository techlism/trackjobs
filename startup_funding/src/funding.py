# funding.py
# from datetime import date
from datetime import date
import json
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from openai import OpenAI
import os
from enum import Enum
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv


class FundRaiseStages(Enum):
    SEED = "Seed"
    SERIES_A = "Series A"
    SERIES_B = "Series B"
    SERIES_C = "Series C"
    SERIES_D = "Series D"
    SERIES_E = "Series E"
    SERIES_F = "Series F"
    PRE_SEED = "Pre-Seed"
    GROWTH = "Growth"
    ANGEL = "Angel"
    DEBT = "Debt"
    NOT_AVAILABLE = "Not Available"

    def __str__(self):
        return self.value


class FundingDetails(BaseModel):
    company_name: str
    amount_raised_usd: Optional[float]
    investors: List[str]
    industry_sector: str
    funding_stage: FundRaiseStages
    # valuation_usd: Optional[float]
    source: Optional[List[str]]

    class Config:
        json_encoders = {FundRaiseStages: lambda v: v.value}


class FundingDetailsList(BaseModel):
    funding_companies_list: List[FundingDetails]

    # def __iter__(self):
    #     return iter(self.root)

    # def __getitem__(self, item):
    #     return self.root[item]

    class Config:
        json_encoders = {FundRaiseStages: lambda v: v.value}


SYSTEM_PROMPT = """
        You are an expert at extracting structured data from HTML content. Extract the following details from the provided HTML:
        1. Company name (combine data from both sources and construct a unique list (list of dicts)).
        2. Amount raised (convert to USD if in INR; 1 USD = 86.8 INR, and please don't write like 0.75 etc. write the value for example for $750K write 750000).
        3. Investors list.
        4. Industry/Sector.
        5. Funding stage (choose from: Seed, Series A, Series B, Series C, Series D, Series E, Series F, Pre-Seed, Angel, Debt).
        6. For the source just answer in terms of ['Entrackr'] ['Inc42'] or ['Entrackr' , 'Inc42']

        Return the data in a structured JSON format.
"""


class ContentExtractor:
    def __init__(self, firefox_binary_path=None, profile_path=None):
        options = Options()
        if firefox_binary_path:
            options.binary_location = firefox_binary_path
        options.add_argument("-no-remote")
        if profile_path:
            options.profile = os.path.expanduser(profile_path)
        self.driver = webdriver.Firefox(options=options)

    def extract_content(self, url: str) -> str:
        try:
            self.driver.get(url)
            if "inc42.com" in url:
                element = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "table"))
                )
            elif "entrackr.com" in url:
                element = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located(
                        (By.CSS_SELECTOR, "div#post-container, div#postContent")
                    )
                )
            else:
                raise ValueError("Unsupported URL type")

            element_html = element.get_attribute("outerHTML")

            if "entrackr.com" in url:
                series_wise_deals_index = element_html.find("[Series-wise deals]")
                if series_wise_deals_index != -1:
                    element_html = element_html[
                        : series_wise_deals_index + len("[Series-wise deals]")
                    ]

            return element_html
        except Exception as e:
            print(f"Error extracting content: {e}")
            raise e

    def extract_funding_details(self, html_content: str) -> FundingDetailsList:
        load_dotenv()
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        user_message = {
            "role": "user",
            "content": f"Extract funding details from the following HTML content:\n\n{html_content}",
        }
        response = client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                user_message,
            ],
            response_format=FundingDetailsList,
        )
        return response.choices[0].message.parsed

    def close(self):
        self.driver.quit()


def main():
    try:
        # Read input JSON from stdin
        input_json = json.loads(input())
        inc42_url = input_json["inc42_url"]
        entrackr_url = input_json["entrackr_url"]

        firefox_path = "/usr/bin/firefox"
        profile_path = "~/.mozilla/firefox/as2wzq75.default-release"

        extractor = ContentExtractor(firefox_path, profile_path)
        inc42_content = "Extracted Content from Inc42\n" + extractor.extract_content(
            inc42_url
        )
        entrackr_content = "HTML Content from Entrackr\n" + extractor.extract_content(
            entrackr_url
        )
        final_content = inc42_content + "\n" + entrackr_content
        funding_data = extractor.extract_funding_details(final_content)

        # Print the funding data to stdout as JSON
        # print(funding_data.model_dump_json())
        with open(f"basic_funding_data_{date.today()}.json", "w") as f:
           json.dump(funding_data.model_dump(mode='json'), f, indent=2)
           f.close()

        return funding_data
    finally:
        if "extractor" in locals():
            extractor.close()


if __name__ == "__main__":
    main()
