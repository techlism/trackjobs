#agent.py
import asyncio
from datetime import date
from enum import Enum
import json
import os
import sys
from langchain_openai import ChatOpenAI
from browser_use import Agent, Browser, BrowserConfig
from openai import OpenAI
from pydantic import BaseModel, RootModel
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

    def __str__(self):
        return self.value

class CombinedFundingDetails(BaseModel):
    company_name: str
    amount_raised_usd: Optional[float] = None  
    investors: List[str] = []  
    industry_sector: str
    funding_stage: FundRaiseStages
    valuation_usd: Optional[float] = None  
    source: Optional[List[str]] = None  
    website: Optional[str] = None   
    linkedin: Optional[str] = None  
    brief_summary: Optional[str] = None  

    class Config:
        json_encoders = {FundRaiseStages: lambda v: v.value}

class FundingDataList(RootModel):
    root: List[CombinedFundingDetails]
    
    def __iter__(self):
        return iter(self.root)

    def __getitem__(self, item):
        return self.root[item]

class FundingDetailsAdditionalFields(BaseModel):
    company_name: str
    website: str
    linkedin: str
    brief_summary: Optional[str]

class AdditionalFundingDetailsList(BaseModel):    
    companies : list[FundingDetailsAdditionalFields]
    
    

async def process_batch(batch_data: list, is_last_batch: bool) -> str:
    try:
        custom_browser = Browser(
            config=BrowserConfig(chrome_instance_path="/usr/bin/chromium-browser")
        )
        llm = ChatOpenAI(model="gpt-4o-mini")
        
        task = f"""
        Given a list of companies with their industry sectors and funding stages, provide their website, LinkedIn profile, and a brief summary for each company.

        Required format for EACH company:
        - Keep the company name EXACTLY as provided
        - Website should be the official company website (including https://)
        - LinkedIn should be the official company page URL (you can verify using the domain name in the linkedin page)
        - Brief summary should be 2-3 sentences about the company's main business and offerings (if found okay, else null)

        Response Schema:
        {{
            "type": "object",
            "properties": {{
                "companies": {{
                    "type": "array",
                    "items": {json.dumps(FundingDetailsAdditionalFields.model_json_schema())}
                }}
            }}
        }}

        Company Data (each entry is [company_name, industry_sector, funding_stage]):
        {json.dumps(batch_data, indent=2)}

        Important:
        - Maintain exact company names as provided
        - If website or LinkedIn cannot be found with high confidence, use null
        - Focus on factual information in summaries
        - Provide data for all companies in the list
        - Avoid getting any other extra info.
        - Take intentional breaks (5 seconds) while searching in google, to avoid rate-limits and captchas.
        - If faced by captcha, just wait.
        """

        agent_instance = Agent(llm=llm, browser=custom_browser, task=task)
        agent_result = (await agent_instance.run()).extracted_content()
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        
        SYSTEM_PROMPT = """
         The data is coming unprocessed from a Browsing Agent, and you have to process it to have it in structured manner.
        """
        
        user_message = {
            "role": "user",
            "content": f"Here is the raw data:\n{('\n').join(agent_result)}"
        }
        
        # Changed to use create instead of parse since we're handling the parsing ourselves
        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                user_message
            ],
            response_format=AdditionalFundingDetailsList
        )
        
        response_text = response.choices[0].message.parsed
        print(response_text)
        # parsed_response = AdditionalFundingDetailsList.model_validate_json(response_text)
        
        if response_text and response_text.companies:
            with open(f'funding_report_{date.today()}.json', 'a') as f:
                for idx, company in enumerate(response_text.companies):
                    json.dump(company.model_dump(mode='json'), f, indent=4)
                    if not (is_last_batch and idx == len(response_text.companies) - 1):
                        f.write(',')
                    f.write('\n')
        
        return response_text
    
    finally:
        if 'custom_browser' in locals():
            await custom_browser.close()

async def main():
    input_data = sys.stdin.buffer.read().decode()
    batch_data = json.loads(input_data)
    is_last_batch = sys.argv[1].lower() == "true" if len(sys.argv) > 1 else False
    await process_batch(batch_data, is_last_batch)
    # sys.stdout.write(result)

if __name__ == "__main__":
    asyncio.run(main())