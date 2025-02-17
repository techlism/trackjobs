# main.py
import asyncio
from enum import Enum
import json
from datetime import date
from typing import List
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


async def run_selenium_scraper(inc42_url: str, entrackr_url: str):
    print("Starting Selenium scraper...")
    try:
        # Run funding.py as a subprocess
        process = await asyncio.create_subprocess_exec(
            "python3",
            "funding.py",
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        # Prepare input data
        input_data = (
            json.dumps({"inc42_url": inc42_url, "entrackr_url": entrackr_url}) + "\n"
        )  # Add newline for proper input reading

        # Send URLs to the subprocess
        stdout, stderr = await process.communicate(input_data.encode())

        if stderr:
            print("Error in selenium scraper:", stderr.decode())
            return None

        if stdout:
            return json.loads(stdout.decode())

    except Exception as e:
        print(f"Error running selenium scraper: {e}")
        return None


async def execute_batches(company_list: List[List[str]], batch_size: int = 5):
    # filename = f"funding-report-{date.today().isoformat()}.json"

    # # Initialize output file
    # with open(filename, "w") as f:
    #     f.write("[\n")

    try:
        total_batches = (len(company_list) + batch_size - 1) // batch_size
        for i in range(0, len(company_list), batch_size):
            batch = company_list[i : i + batch_size]
            is_last_batch = (i + batch_size) >= len(company_list)
            is_first_batch = i == 0
            print(f"\nProcessing batch {(i//batch_size) + 1}/{total_batches}")
            print("-" * 50)  # Separator line

            process = await asyncio.create_subprocess_exec(
                "python3",
                "agent.py",
                str(is_last_batch),
                str(is_first_batch),
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            batch_json = json.dumps(batch) + "\n"
            stdout, stderr = await process.communicate(batch_json.encode())

            if stderr:
                print(f"Error in batch {(i//batch_size) + 1}:", stderr.decode())
                continue

            output_data = stdout.decode().strip()
            print(output_data)
            print(f"\nCompleted batch {(i//batch_size) + 1}")
            print(f"Waiting 10 seconds before next batch...")
            await asyncio.sleep(30)
    except Exception as e:
        print(f"An Error Occurred While Processing Startup Data: {e}")
    finally:
        # with open(filename, "a") as f:
        #     f.write("\n]")
        print("\nAll batches completed. Results saved.\n")


async def main():
    # Get URLs from user
    inc42_url = "https://inc42.com/buzz/from-tonetag-to-borderplus-indian-startups-raised-270-mn-this-week/"
    entrackr_url = "https://entrackr.com/report/weekly-funding-report/funding-and-acquisitions-in-indian-startup-this-week-feb-10-feb-15-8723898"

    # Run the selenium scraper with the URLs
    await run_selenium_scraper(inc42_url, entrackr_url)
    # with open(f"basic_funding_data_{date.today()}.json", "r") as f:
    #     json_data = json.load(f)

    #     # Parse back into Pydantic model
    #     funding_data = FundingDetailsList.model_validate(json_data)
    #     f.close()
    
    # if not funding_data:
    #     print("Failed to get initial funding data")
    #     return



    # company_list : list[list[str]] = [
    #     [company.company_name, company.industry_sector, company.funding_stage.value]
    #     for company in funding_data.funding_companies_list
    # ]
    # print(len(company_list))
    # company_list = [
    #     ["Cashfree Payments", "Fintech", "FundRaiseStages.SERIES_C"],
    #     ["Captain Fresh", "Ecommerce", "FundRaiseStages.NOT_AVAILABLE"],
    #     ["TrueFoundry", "Enterprisetech", "FundRaiseStages.SERIES_A"],
    #     ["HairOriginals", "Ecommerce", "FundRaiseStages.SERIES_A"],
    #     ["Shadowfax", "Logistics", "FundRaiseStages.SERIES_F"],
    #     ["Nua", "Ecommerce", "FundRaiseStages.PRE_SEED"],
    # ]
    # await execute_batches(company_list, batch_size=4)


if __name__ == "__main__":
    asyncio.run(main())
