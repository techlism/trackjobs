from datetime import date, datetime, timedelta
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from browser_use import Agent, Browser, BrowserConfig
import asyncio
import json
import os
from enum import Enum
from pydantic import BaseModel, Field, validator
from typing import List, Optional

class FundingStage(str, Enum):
    SEED = "Seed"
    PRE_SERIES_A = "pre-Series A"
    SERIES_A = "Series A"
    SERIES_B = "Series B"
    SERIES_C = "Series C"
    SERIES_D = "Series D"
    SERIES_E = "Series E"
    LATE_STAGE = "Late Stage"
    UNDISCLOSED = "Undisclosed"

class Amount(BaseModel):
    value: Optional[float] = None
    currency: str = "USD"
    is_undisclosed: bool = False
    
    @validator('value')
    def validate_value(cls, v):
        if v is not None and v < 0:
            raise ValueError("Amount cannot be negative")
        return v

class FundingCompany(BaseModel):
    company_name: str
    amount: Amount
    investors: List[str] = Field(default_factory=list)
    industry: str
    stage: FundingStage
    website: Optional[str] = None
    linkedin: Optional[str] = None
    sources: List[str] = Field(default_factory=list)
    summary: str

class FundingReport(BaseModel):
    report_title: str
    companies: List[FundingCompany]
    report_date: date
    total_companies: int
    total_funding: Optional[float] = None

custom_browser = Browser(
    config=BrowserConfig(
        chrome_instance_path='/usr/bin/ungoogled-chromium'
    )
)     
  
async def main():
    load_dotenv()
    
    # Calculate date range
    last_saturday = date.today() - timedelta(days=(date.today().weekday() + 2) % 7)
    next_saturday = last_saturday - timedelta(days=7)
    
    # Step 1: Primary data collection from Inc42
    primary_task = f"""
    Visit https://inc42.com/buzz/from-cashfree-payments-to-shadowfax-indian-startups-raised-125-mn-this-week/ (specifically this url and this one only) and find the most funding report of this week.Second There's a table of report focus on that, you've to scroll a bit.
    The report should cover the period between {last_saturday.strftime('%d %b')} and {next_saturday.strftime('%d %b %Y')}.
    
    Extract the following for each company in the table format:
    1. Company name
    2. Amount raised
    3. Investors list
    4. Industry/Sector
    5. Funding stage    
    6. Brief summary (from the article if available)
    7. Valuation
    
    Return the data in this JSON format:
    {{
        "report_period": "{last_saturday.strftime('%d %b')} - {next_saturday.strftime('%d %b %Y')}",
        "companies": [
            {{
                "name": str,
                "amount": str
                "investors": [str],
                "industry": str,
                "stage": str,
                "summary": str,
                "source_url": str,
                "valuation" : float                
            }}
        ]
    }}
    
    Notes:
    - For undisclosed amounts, set value to 0
    - For valuation it is okay if no data is there, and just mention unavailable
    """
    
    llm = ChatOpenAI(model='gpt-4o')
    agent = Agent(primary_task, llm=llm, browser=custom_browser)
    primary_data = (await agent.run()).extracted_content()[-1]
    agent.stop()
    agent.browser.close()
    print("Primary_Data: ",primary_data)
    filename = f"funding-report-{date.today().isoformat()}-inc42.json"
    with open(filename, "w") as f:
        f.write(primary_data.model_dump_json(indent=2))
    print(f"✅ Report saved to {filename}")
    # primary_companies = json.loads(primary_data)['companies']
    
    # Step 2: Check other sources
    # company_names = ', '.join([c['name'] for c in primary_companies])
    supplementary_task = f"""
    Visit these websites to find funding news from {last_saturday.strftime('%d %b')} to {next_saturday.strftime('%d %b %Y')}:
    1. https://yourstory.com/category/funding
    2. https://entrackr.com/weekly-funding-report-weekly-funding-report
    
    Known companies data from Inc42:
    {primary_data}
    
    For each NEW company (not in above list) and any additional information about EXISTING companies, extract the same details in the same JSON format.
    Focus only on the exact date range mentioned.
    """
        
    agent2 = Agent(supplementary_task, llm=llm, browser=custom_browser)
    
    supplementary_data = json.loads((await agent2.run()).extracted_content()[-1])
    print("Sup_DATA: ",supplementary_data)
    # Step 3: Enrich with website and LinkedIn data
    # all_companies = primary_companies + json.loads(supplementary_data)['companies']
    # company_chunks = [all_companies[i:i+5] for i in range(0, len(all_companies), 5)]
    return
    enriched_data = {}
    for chunk in company_chunks:
        enrich_task = f"""
        For these companies, find and verify:
        1. Official website URL
        2. LinkedIn company page URL (only if verified)
        
        Companies:
        {'\n'.join([f"- {c['name']} ({c['industry']})" for c in chunk])}
        
        Return in JSON format:
        {{
            "company_name": {{
                "website": "verified_url"|null,
                "linkedin": "verified_linkedin_url"|null
            }}
        }}
        
        Only include URLs that you can verify are official.
        """
        
        agent = Agent(enrich_task, llm=llm)
        chunk_data = await agent.run()
        enriched_data.update(json.loads(chunk_data))
    
    # Create final report
    companies = []
    for company in all_companies:
        enriched = enriched_data.get(company['name'], {})
        companies.append(FundingCompany(
            company_name=company['name'],
            amount=Amount(**company['amount']),
            investors=company['investors'],
            industry=company['industry'],
            stage=company['stage'],
            website=enriched.get('website'),
            linkedin=enriched.get('linkedin'),
            sources=[company['source_url']],
            summary=company['summary']
        ))
    
    report = FundingReport(
        report_title=f"Funding Report {last_saturday.strftime('%d-%b')} to {next_saturday.strftime('%d-%b-%Y')}",
        companies=companies,
        report_date=date.today(),
        total_companies=len(companies),
        total_funding=sum(c.amount.value for c in companies if c.amount.value is not None)
    )
    print(report)
    
    # Save report
    filename = f"funding-report-{date.today().isoformat()}.json"
    with open(filename, "w") as f:
        f.write(report.model_dump_json(indent=2))
    print(f"✅ Report saved to {filename}")

if __name__ == "__main__":
    asyncio.run(main())