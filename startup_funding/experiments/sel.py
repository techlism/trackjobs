import asyncio
from datetime import date
import time
import json
from browser_use import Agent, Browser, BrowserConfig
from langchain_openai import ChatOpenAI
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os
from enum import Enum

# import asyncio
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),  # This is the default and can be omitted
)

from pydantic import BaseModel
from typing import List, Optional


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


class FundingDetails(BaseModel):
    company_name: str
    amount_raised_usd: Optional[float]
    investors: List[str]
    industry_sector: str
    funding_stage: FundRaiseStages

    valuation_usd: Optional[float]
    source: Optional[List[str]]

    class Config:
        json_encoders = {FundRaiseStages: lambda v: v.value}


class FundingDetailsList(BaseModel):
    funding_companies_list: List[FundingDetails]

    class Config:
        json_encoders = {FundRaiseStages: lambda v: v.value}


class FundingDetailsAdditionalFields(BaseModel):
    company_name: str
    website: str
    linkedin: str
    brief_summary: Optional[str]


SYSTEM_PROMPT = """
You are an expert at extracting structured data from HTML content. Extract the following details from the provided HTML:
1. Company name (combine data from both sources and construct a unique list (list of dicts)).
2. Amount raised (convert to USD if in INR; 1 USD = 86 INR).
3. Investors list.
4. Industry/Sector.
5. Funding stage (choose from: Seed, Series A, Series B, Series C, Series D, Series E, Series F, Pre-Seed, Angel, Debt).
6. Valuation (convert to USD if in INR; 1 USD = 86 INR).
7. For the source just answer in terms of ['Entrackr'] ['Inc42'] or ['Entrackr' , 'Inc42']

Return the data in a structured JSON format.
"""


class ContentExtractor:
    def __init__(self, firefox_binary_path=None, profile_path=None):
        options = Options()

        if firefox_binary_path:
            options.binary_location = firefox_binary_path

        options.add_argument("-no-remote")  # Ensure no remote connections interfere

        if profile_path:
            full_path = os.path.expanduser(
                profile_path
            )  # Resolve '~' to the home directory
            options.profile = full_path

        # Uncomment to run in headless mode
        # options.add_argument("-headless")

        self.driver = webdriver.Firefox(options=options)

    def extract_content(self, url: str) -> str:
        try:
            self.driver.get(url)

            # Determine the URL type
            if "inc42.com" in url:
                # For Inc42, extract the table
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "table"))
                )
                element = self.driver.find_element(By.CSS_SELECTOR, "table")
            elif "entrackr.com" in url:
                # For Entrackr, extract the div with id "post-container" or "postContent"
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located(
                        (By.CSS_SELECTOR, "div#post-container, div#postContent")
                    )
                )
                element = self.driver.find_element(
                    By.CSS_SELECTOR, "div#post-container, div#postContent"
                )
            else:
                raise ValueError("Unsupported URL type")

            # Get the HTML content of the element
            element_html = element.get_attribute("outerHTML")

            # Extract content up to "[Series-wise deals]"
            if "entrackr.com" in url:
                # Find the position of "[Series-wise deals]"
                series_wise_deals_index = element_html.find("[Series-wise deals]")
                if series_wise_deals_index != -1:
                    # Extract content up to and including "[Series-wise deals]"
                    element_html = element_html[
                        : series_wise_deals_index + len("[Series-wise deals]")
                    ]

            return element_html
        except Exception as e:
            print(f"Error extracting content: {e}")
            raise e

    def extract_funding_details(self, html_content: str) -> FundingDetailsList | None:
        # Construct the user message
        user_message = {
            "role": "user",
            "content": f"Extract funding details from the following HTML content:\n\n{html_content}",
        }

        # Make the API request
        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",  # Use GPT-4 for better accuracy
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                user_message,
            ],
            response_format=FundingDetailsList,  # Ensure the response is in JSON format
        )

        # Parse the response into the FundingDetails schema
        return response.choices[0].message.parsed

    def close(self):
        self.driver.quit()


def get_funding_detail():
    try:
        # Example URLs
        inc42_url = input("\nPlease enter this week's inc42 url\n")
        entrackr_url = input("\nPlease enter this week's Entrackr URL\n")
        # Firefox paths - adjust these according to your system
        firefox_path = "/usr/bin/firefox"  # Path to Firefox binary
        profile_path = (
            "~/.mozilla/firefox/as2wzq75.default-release"  # Path to Firefox profile
        )

        # Create the ContentExtractor instance
        extractor = ContentExtractor(firefox_path, profile_path)
        # Extract and print content for Inc42 URL
        # print("\nExtracted Content from Inc42:")
        inc42_content = "Extracted Content from Inc42\n" + extractor.extract_content(
            inc42_url
        )
        # print(inc42_content)

        # Extract and print content for Entrackr URL
        # print("\nExtracted Content from Entrackr:")
        entrackr_content = "HTML Content from Entrackr\n" + extractor.extract_content(
            entrackr_url
        )
        # print(entrackr_content)
        final_content = inc42_content + "\n" + entrackr_content
        final_data = extractor.extract_funding_details(final_content)
        return final_data
    finally:
        # Close the WebDriver instance
        extractor.close()


custom_browser = Browser(
    config=BrowserConfig(chrome_instance_path="/usr/bin/chromium-browser")
)


async def get_additional_fields(
    funding_detail: FundingDetailsList | None  = None, batch_size: int = 21
):
    # Create the structured data
    # simple_company_list = [
    #     [company.company_name, company.industry_sector, str(company.funding_stage)]
    #     for company in funding_detail.funding_companies_list
    # ]
    # print(simple_company_list)
    simple_company_list = [
        ["Cashfree Payments", "Fintech", "FundRaiseStages.SERIES_C"],
        ["Captain Fresh", "Ecommerce", "FundRaiseStages.NOT_AVAILABLE"],
        ["TrueFondry", "Enterprisetech", "FundRaiseStages.SERIES_A"],
        ["HairOriginals", "Ecommerce", "FundRaiseStages.SERIES_A"],
        ["Shadowfax", "Logistics", "FundRaiseStages.SERIES_F"],
        ["Nua", "Ecommerce", "FundRaiseStages.PRE_SEED"],
        ["Presentations.AI", "Enterprisetech", "FundRaiseStages.SEED"],
        ["Astra Security", "Enterprisetech", "FundRaiseStages.NOT_AVAILABLE"],
        ["Dreamfly Innovations", "Cleantech", "FundRaiseStages.SEED"],
        ["Mealawe", "Consumer Services", "FundRaiseStages.NOT_AVAILABLE"],
        ["Quicklend", "Fintech", "FundRaiseStages.PRE_SEED"],
        ["Babynama", "Healthtech", "FundRaiseStages.SEED"],
        ["PlaySuper", "Enterprisetech", "FundRaiseStages.SEED"],
        ["Origamis AI", "Enterprisetech", "FundRaiseStages.SEED"],
        ["LegUp", "Consumer Services", "FundRaiseStages.PRE_SEED"],
        ["Boba Bhai", "Consumer Services", "FundRaiseStages.NOT_AVAILABLE"],
        ["Super Gaming", "Media & Entertainment", "FundRaiseStages.NOT_AVAILABLE"],
        ["BuilditIndia", "Ecommerce", "FundRaiseStages.NOT_AVAILABLE"],
        ["Curefoods", "Consumer Services", "FundRaiseStages.NOT_AVAILABLE"],
        ["Vahan.ai", "Enterprisetech", "FundRaiseStages.NOT_AVAILABLE"],
        ["Basil Alliance", "Enterprisetech", "FundRaiseStages.NOT_AVAILABLE"],
        ["Infra.Market", "Building Material", "FundRaiseStages.SERIES_F"],
        ["Arya.ag", "Agritech", "FundRaiseStages.DEBT"],
        ["Ati Motors", "Industrial Robotics", "FundRaiseStages.SERIES_B"],
        ["Deconstruct", "D2C Skincare", "FundRaiseStages.NOT_AVAILABLE"],
        ["Medusa", "Beer Brand", "FundRaiseStages.NOT_AVAILABLE"],
        ["Snabbit", "Home Service Marketplace", "FundRaiseStages.NOT_AVAILABLE"],
        ["Landeed", "Real Estate Document Search", "FundRaiseStages.NOT_AVAILABLE"],
        ["KisanKonnect", "Agritech", "FundRaiseStages.NOT_AVAILABLE"],
        ["CapGrid", "Deeptech", "FundRaiseStages.NOT_AVAILABLE"],
        ["Spare8", "B2B2C Fintech", "FundRaiseStages.NOT_AVAILABLE"],
        ["Not Available", "Not Available", "FundRaiseStages.NOT_AVAILABLE"],
    ]
    # Initialize LLM
    llm = ChatOpenAI(model="gpt-4o")
    filename = f"funding-report-{date.today().isoformat()}.json"

    def agent(task: str) -> Agent:
        return Agent(llm=llm, browser=custom_browser, task=task)

    # Process in batches
    with open(filename, "a") as f:
        f.write("[\n")  # Start JSON array

        for i in range(0, len(simple_company_list), batch_size):
            batch = simple_company_list[i : i + batch_size]
            print(
                f"Processing batch {(i//batch_size) + 1}/{(len(simple_company_list) + batch_size - 1)//batch_size}"
            )

            task = f"""
            Given a list of companies with their industry sectors and funding stages, provide their website, LinkedIn profile, and a brief summary for each company.

            Required format for EACH company:
            - Keep the company name EXACTLY as provided
            - Website should be the official company website (including https://)
            - LinkedIn should be the official company page URL (you can verify using the domain name in the linkedin page)
            - Brief summary should be 2-3 sentences about the company's main business and offerings (if found okay, else null)

            Response Schema:
            {json.dumps(FundingDetailsAdditionalFields.model_json_schema(), indent=2)}

            Company Data (each entry is [company_name, industry_sector, funding_stage]):
            {json.dumps(batch, indent=2)}

            Important:
            - Maintain exact company names as provided
            - If website or LinkedIn cannot be found with high confidence, use null
            - Focus on factual information in summaries
            - Provide data for all companies in the list
            - Take intenional breaks (5 seconds) while searching in google, to avoid rate-limits and captchas.
            - Do the task for all the entries.
            """

            agent_llm = agent(task)
            output_data = (await agent_llm.run()).extracted_content()[-1]
            # agent.browser.close()
            # agent.stop()

            if not output_data:
                print(f"Unable to Collect Data for batch {(i//batch_size) + 1}")
                continue
            print(f"{i}th Batch Output:\n", output_data)
            if i > 0:  # Add comma for all but first batch
                f.write(",\n")
            f.write(output_data.strip())
            # print("\nPlease close the existing instance of Chromium\n")
            # time.sleep(5)

        f.write("\n]")  # End JSON array


async def main():
    # FUNDING_DATA = get_funding_detail()
    # if not FUNDING_DATA:
    #     print("No Funding Data")
    #     return
    # with open("report.json", "a") as f:
    #     f.write(json.dumps(FUNDING_DATA.model_dump_json()))
    await get_additional_fields()


asyncio.run(main())
