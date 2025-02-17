from enum import Enum
import json
from typing import List, Optional
from pydantic import BaseModel, ValidationError
import os
import uuid
from datetime import date, datetime
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
    companies: List[FinalFundingDetails]

class FundingDetailsAdditionalFields(BaseModel):
    company_name: str
    website: str
    linkedin: str
    brief_summary: Optional[str]
    valuation_usd: Optional[float] = None

class AdditionalFundingDetailsList(BaseModel):
    companies: List[FundingDetailsAdditionalFields]

def load_and_validate_funding():
    try:    
        with open(f'basic_funding_data_{date.today()}.json', 'r') as file:
            data = json.load(file)
            validated_companies_data = FundingDetailsList.model_validate(data)
            return validated_companies_data
    except ValidationError as e:
        print(f"Validation error in funding data: {e}")
        return None
    except Exception as e:
        print(f"Error loading funding data: {e}")
        return None

def load_and_validate_companies():
    try:
        with open(f'extended_funding_data_{date.today()}.json', 'r') as file:
            data = json.load(file)
            validated_company_additional_data = AdditionalFundingDetailsList.model_validate(data)
            return validated_company_additional_data
    except ValidationError as e:
        print(f"Validation error in company data: {e}")
        return None
    except Exception as e:
        print(f"Error loading company data: {e}")
        return None

def generate_uuid():
    """Generate a UUID hex string"""
    return uuid.uuid4().hex

async def create_turso_table(client: Client):
    """Create database schema in Turso"""
    try:
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
            round_id TEXT PRIMARY KEY DEFAULT (uuid()),
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
    except Exception as e:
        print(f"Error creating tables: {e}")
        raise

async def insert_weekly_data(client: Client, funding_data: FinalFundingDataList, snapshot_date: Optional[str] = None):
    """Insert data with weekly snapshot into Turso"""
    if snapshot_date is None:
        snapshot_date = datetime.now().strftime('%Y-%m-%d')
    
    for company in funding_data.companies:
        try:
            company_id = generate_uuid()
            
            # First check if company exists and get its data
            existing_company = await client.execute(
                "SELECT company_id, website, linkedin, brief_summary FROM companies WHERE company_name = ?",
                [company.company_name]
            )
            
            if existing_company.rows:
                # Company exists - update only if new data is available
                company_id = existing_company.rows[0][0]
                current_website = existing_company.rows[0][1]
                current_linkedin = existing_company.rows[0][2]
                current_brief_summary = existing_company.rows[0][3]
                
                # Use existing values if new ones are empty/None
                website = company.website if company.website else current_website
                linkedin = company.linkedin if company.linkedin else current_linkedin
                brief_summary = company.brief_summary if company.brief_summary else current_brief_summary
                
                await client.execute('''
                UPDATE companies 
                SET 
                    industry_sector = ?,
                    website = ?,
                    linkedin = ?,
                    brief_summary = ?
                WHERE company_id = ?
                ''', [
                    company.industry_sector,
                    website,
                    linkedin,
                    brief_summary,
                    company_id
                ])
            else:
                # New company - insert all data
                await client.execute('''
                INSERT INTO companies 
                (company_id, company_name, industry_sector, website, linkedin, brief_summary)
                VALUES (?, ?, ?, ?, ?, ?)
                ''', [
                    company_id,
                    company.company_name,
                    company.industry_sector,
                    company.website,
                    company.linkedin,
                    company.brief_summary
                ])

            # Insert funding round with weekly snapshot
            # Use either the funding_data valuation or company valuation, prioritizing non-null values
            valuation = company.valuation_usd if company.valuation_usd is not None else None
            
            await client.execute('''
            INSERT INTO funding_rounds 
            (round_id, company_id, amount_raised_usd, funding_stage, valuation_usd, 
             investors, sources, snapshot_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(company_id, snapshot_date) DO UPDATE SET
            amount_raised_usd = excluded.amount_raised_usd,
            funding_stage = excluded.funding_stage,
            valuation_usd = COALESCE(excluded.valuation_usd, funding_rounds.valuation_usd),
            investors = COALESCE(excluded.investors, funding_rounds.investors),
            sources = COALESCE(excluded.sources, funding_rounds.sources)
            ''', [
                generate_uuid(),
                company_id,
                company.amount_raised_usd,
                str(company.funding_stage),
                valuation,
                ','.join(company.investors) if company.investors else None,
                ','.join(company.source) if company.source else None,
                snapshot_date
            ])
        except Exception as e:
            print(f"Error processing company {company.company_name}: {e}")
            continue

async def query_latest_rounds(client: Client):
    """Query latest funding rounds from Turso"""
    try:
        result = await client.execute('''
            SELECT 
                c.company_name,
                c.industry_sector,
                fr.amount_raised_usd,
                fr.funding_stage,
                fr.valuation_usd,
                fr.investors,
                fr.snapshot_date
            FROM companies c
            LEFT JOIN funding_rounds fr ON c.company_id = fr.company_id
            WHERE fr.snapshot_date = (
                SELECT MAX(snapshot_date) 
                FROM funding_rounds 
                WHERE company_id = c.company_id
            )
        ''')
        
        for row in result.rows:
            print(f"\nCompany: {row[0]}")
            print(f"Industry: {row[1]}")
            print(f"Latest Amount: ${row[2]:,.2f}" if row[2] else "Amount: Not disclosed")
            print(f"Stage: {row[3]}")
            print(f"Valuation: ${row[4]:,.2f}" if row[4] else "Valuation: Not disclosed")
            print(f"Investors: {row[5]}" if row[5] else "Investors: None")
            print(f"Snapshot Date: {row[6]}")
    except Exception as e:
        print(f"Error querying latest rounds: {e}")

async def main():
    # Load and validate data
    funding_data = load_and_validate_funding()
    if not funding_data:
        print("Failed to load funding data")
        return
        
    additional_data = load_and_validate_companies()
    if not additional_data:
        print("Failed to load additional company data")
        return

    # Create a mapping of company data with valuations
    company_data_map = {
        company.company_name: company 
        for company in additional_data.companies
    }
    
    # Combine the data
    combined_companies = []
    
    for funding in funding_data.funding_companies_list:
        additional_info = company_data_map.get(funding.company_name, None)
        
        # Create combined record with valuation from additional data if available
        combined_record = FinalFundingDetails(
            company_name=funding.company_name,
            amount_raised_usd=funding.amount_raised_usd,
            investors=funding.investors,
            industry_sector=funding.industry_sector,
            funding_stage=funding.funding_stage,
            valuation_usd=additional_info.valuation_usd if additional_info else None,
            source=funding.source,
            website=additional_info.website if additional_info else None,
            linkedin=additional_info.linkedin if additional_info else None,
            brief_summary=additional_info.brief_summary if additional_info else None
        )
        combined_companies.append(combined_record)
    
    # Create final combined dataset
    final_funding_data = FinalFundingDataList(companies=combined_companies)
    
    client = None
    try:
        # Initialize Turso client
        client = libsql_client.create_client(url=TURSO_URL, auth_token=TURSO_AUTH_TOKEN)
        
        # Create tables if they don't exist
        # await create_turso_table(client)
        
        # Insert current week's data
        snapshot_date = datetime.now().strftime('%Y-%m-%d')
        await insert_weekly_data(client, final_funding_data, snapshot_date)
        
        # Optionally query and display results
        # await query_latest_rounds(client)
        
    except Exception as e:
        print(f"Error in main execution: {e}")
    finally:
        if client:
            await client.close()
        print('SAVED')

if __name__ == "__main__":    
    asyncio.run(main())