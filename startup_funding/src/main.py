# main.py
import asyncio
import json
from datetime import date
from typing import List


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


async def execute_batches(company_list: List[List[str]], batch_size: int = 21):
    filename = f"funding-report-{date.today().isoformat()}.json"

    # Initialize output file
    with open(filename, "w") as f:
        f.write("[\n")

    try:
        total_batches = (len(company_list) + batch_size - 1) // batch_size
        for i in range(0, len(company_list), batch_size):
            batch = company_list[i : i + batch_size]
            is_last_batch = (i + batch_size) >= len(company_list)
            print(f"\nProcessing batch {(i//batch_size) + 1}/{total_batches}")
            print("-" * 50)  # Separator line

            process = await asyncio.create_subprocess_exec(
                "python3",
                "agent.py",
                str(is_last_batch),
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
            await asyncio.sleep(10)
    except Exception as e:
        print(f"An Error Occurred While Processing Startup Data: {e}")
    finally:
        with open(filename, "a") as f:
            f.write("\n]")
        print("\nAll batches completed. Results saved to", filename)


async def main():
    # Get URLs from user
    inc42_url = "https://inc42.com/buzz/from-cashfree-payments-to-shadowfax-indian-startups-raised-125-mn-this-week/"
    entrackr_url = "https://entrackr.com/report/weekly-funding-report/funding-and-acquisitions-in-indian-startup-this-week-20-25-jan-8653369"

    # Run the selenium scraper with the URLs
    funding_data = await run_selenium_scraper(inc42_url, entrackr_url)

    if not funding_data:
        print("Failed to get initial funding data")
        return

    with open("initial_funding_data.json", "w") as f:
        json.dump(funding_data, f, indent=2)

    company_list = [
        [company["company_name"], company["industry_sector"], company["funding_stage"]]
        for company in funding_data["funding_companies_list"]
    ]
    print(company_list)
    # company_list = [
    #     ["Cashfree Payments", "Fintech", "FundRaiseStages.SERIES_C"],
    #     ["Captain Fresh", "Ecommerce", "FundRaiseStages.NOT_AVAILABLE"],
    #     ["TrueFoundry", "Enterprisetech", "FundRaiseStages.SERIES_A"],
    #     ["HairOriginals", "Ecommerce", "FundRaiseStages.SERIES_A"],
    #     ["Shadowfax", "Logistics", "FundRaiseStages.SERIES_F"],
    #     ["Nua", "Ecommerce", "FundRaiseStages.PRE_SEED"],
    # ]
    await execute_batches(company_list, batch_size=5)


if __name__ == "__main__":
    asyncio.run(main())
