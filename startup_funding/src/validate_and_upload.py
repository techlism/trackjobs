from enum import Enum
import json
from typing import List, Optional
from pydantic import BaseModel, ValidationError
import os
import uuid
from datetime import datetime
from typing import Optional
import asyncio
import libsql_client
from libsql_client import Client
from dotenv import load_dotenv
load_dotenv() 

# Turso connection settings
TURSO_URL = os.getenv("TURSO_DATABASE_URL")
TURSO_AUTH_TOKEN = os.getenv("TURSO_AUTH_TOKEN")

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
    valuation_usd: Optional[float]
    source: Optional[List[str]]

    class Config:
        json_encoders = {FundRaiseStages: lambda v: v.value}


class FundingDetailsList(BaseModel):
    funding_companies_list: List[FundingDetails]

    class Config:
        json_encoders = {FundRaiseStages: lambda v: v.value}


class FinalFundingDetails(BaseModel):
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


class FinalFundingDataList(BaseModel):
    companies : List[FinalFundingDetails]


class FundingDetailsAdditionalFields(BaseModel):
    company_name: str
    website: str
    linkedin: str
    brief_summary: Optional[str]


class AdditionalFundingDetailsList(BaseModel):
    companies: list[FundingDetailsAdditionalFields]


def load_and_validate_funding():
    try:    
        with open('initial_funding_data.json', 'r') as file:
            data = json.load(file)
            validated_companies_data = FundingDetailsList.model_validate(data)
            return validated_companies_data
    except ValidationError as e:
        print(e)
        return None
        
def load_and_validate_companies():
    try:
        with open('funding_report_2025-02-10.json' , 'r') as file:
            data = json.load(file)
            validated_company_additional_data = AdditionalFundingDetailsList.model_validate(data)
            return validated_company_additional_data
    except ValidationError as e:
        print(e)
        return None    



def generate_uuid():
    """Generate a UUID hex string"""
    return uuid.uuid4().hex

async def create_turso_table(s):
    # print(TURSO_URL, '\n', TURSO_AUTH_TOKEN)
    """Create database schema in Turso"""
    # client = Client(
    #     url=TURSO_URL,
    #     auth_token=TURSO_AUTH_TOKEN
    # )
    client = libsql_client.create_client(url=TURSO_URL, auth_token=TURSO_AUTH_TOKEN)
    # Create companies table with UUID primary key
    await client.execute('''
    CREATE TABLE IF NOT EXISTS companies (
        company_id TEXT PRIMARY KEY,
        company_name TEXT UNIQUE,
        industry_sector TEXT,
        website TEXT,
        linkedin TEXT,
        brief_summary TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create funding_rounds table with UUID primary key
    await client.execute('''
    CREATE TABLE IF NOT EXISTS funding_rounds (
        round_id TEXT PRIMARY KEY DEFAULT (uuid()),  -- Use uuid() to generate a default UUID
        company_id TEXT,
        amount_raised_usd REAL,
        funding_stage TEXT,
        valuation_usd REAL,
        investors TEXT,
        sources TEXT,
        snapshot_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(company_id),
        UNIQUE(company_id, snapshot_date)
    )
    ''')
    client.close()

async def insert_weekly_data(client: Client, funding_data: FinalFundingDataList, snapshot_date: Optional[str] = None):
    """Insert data with weekly snapshot into Turso"""
    if snapshot_date is None:
        snapshot_date = datetime.now().strftime('%Y-%m-%d')
    
    for company in funding_data.companies:
        company_id = generate_uuid()
        
        # Insert or update company data
        result = await client.execute('''
        INSERT INTO companies 
        (company_id, company_name, industry_sector, website, linkedin, brief_summary)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(company_name) DO UPDATE SET
        industry_sector = excluded.industry_sector,
        website = excluded.website,
        linkedin = excluded.linkedin,
        brief_summary = excluded.brief_summary
        ''', [
            company_id,
            company.company_name,
            company.industry_sector,
            company.website,
            company.linkedin,
            company.brief_summary
        ])

        # Get company_id if it was an update
        if result.rows_affected == 0:
            result = await client.execute(
                "SELECT company_id FROM companies WHERE company_name = ?",
                [company.company_name]
            )
            company_id = result.rows[0][0]

        # Insert funding round with weekly snapshot
        await client.execute('''
        INSERT INTO funding_rounds 
        (round_id, company_id, amount_raised_usd, funding_stage, valuation_usd, 
         investors, sources, snapshot_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(company_id, snapshot_date) DO UPDATE SET
        amount_raised_usd = excluded.amount_raised_usd,
        funding_stage = excluded.funding_stage,
        valuation_usd = excluded.valuation_usd,
        investors = excluded.investors,
        sources = excluded.sources
        ''', [
            generate_uuid(),
            company_id,
            company.amount_raised_usd,
            str(company.funding_stage),
            company.valuation_usd,
            ','.join(company.investors) if company.investors else None,
            ','.join(company.source) if company.source else None,
            snapshot_date
        ])     

# async def query_latest_rounds(client: Client):
#     """Query latest funding rounds from Turso"""
#     result = await client.execute('''
#         SELECT 
#             c.company_name,
#             c.industry_sector,
#             fr.amount_raised_usd,
#             fr.funding_stage,
#             fr.investors,
#             fr.snapshot_date
#         FROM companies c
#         LEFT JOIN funding_rounds fr ON c.company_id = fr.company_id
#         WHERE fr.snapshot_date = (
#             SELECT MAX(snapshot_date) 
#             FROM funding_rounds 
#             WHERE company_id = c.company_id
#         )
#     ''')
    
#     for row in result.rows:
#         print(f"\nCompany: {row[0]}")
#         print(f"Industry: {row[1]}")
#         print(f"Latest Amount: ${row[2]:,.2f}" if row[2] else "Amount: Not disclosed")
#         print(f"Stage: {row[3]}")
#         print(f"Investors: {row[4]}" if row[4] else "Investors: None")
#         print(f"Snapshot Date: {row[5]}")

async def main():
    funding_data = load_and_validate_funding().funding_companies_list
    additional_data = load_and_validate_companies().companies
    
    # Filter additional_data for companies with web presence
    web_present_companies = {
        company.company_name: company 
        for company in additional_data 
        if company.website or company.linkedin
    }
    
    # Perform the join and create combined records
    combined_companies = []
    
    for funding in funding_data:
        if funding.company_name in web_present_companies:
            additional_info = web_present_companies[funding.company_name]
            
            combined_record = FinalFundingDetails(
                company_name=funding.company_name,
                amount_raised_usd=funding.amount_raised_usd,
                investors=funding.investors,
                industry_sector=funding.industry_sector,
                funding_stage=funding.funding_stage,
                valuation_usd=funding.valuation_usd,
                source=funding.source,
                website=additional_info.website,
                linkedin=additional_info.linkedin,
                brief_summary=additional_info.brief_summary
            )
            combined_companies.append(combined_record)
    
    # Create final combined dataset
    funding_data = FinalFundingDataList(companies=combined_companies)
    
    client = None
    try:
        # Initialize Turso client
        client = libsql_client.create_client(url=TURSO_URL, auth_token=TURSO_AUTH_TOKEN)
        
        # Create tables if they don't exist
        await create_turso_table(client)
        
        # Insert current week's data
        snapshot_date = datetime.now().strftime('%Y-%m-%d')
        await insert_weekly_data(client, funding_data, snapshot_date)
        
        # Query and display results
        # await query_latest_rounds(client)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if client:
            await client.close()
        print('SAVED')

if __name__ == "__main__":    
    asyncio.run(main())    