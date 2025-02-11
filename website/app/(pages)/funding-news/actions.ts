"use server"

import { desc, eq, and, asc, sql, type SQL } from "drizzle-orm"
import db from "@/lib/database/client"
import { companies, funding_rounds } from "@/lib/database/schema"
import type { DashboardData, Company, FundingFilters } from "@/lib/types"



export async function getFundingData(page = 1, filters: FundingFilters = {}): Promise<DashboardData> {
  try {
    // Get distinct snapshot dates ordered by most recent
    const dates = await db
      .select({ snapshot_date: funding_rounds.snapshot_date })
      .from(funding_rounds)
      .groupBy(funding_rounds.snapshot_date)
      .orderBy(desc(funding_rounds.snapshot_date))

    // Get industries for the filter
    const industries = await getIndustries()

    // Get total number of unique snapshot dates for pagination
    const totalBatches = dates.length
    const batchesPerPage = 1
    const totalPages = Math.ceil(totalBatches / batchesPerPage)

    // Get the snapshot date for the requested page
    const targetDate = dates[(page - 1) * batchesPerPage]?.snapshot_date

    if (!targetDate) {
      return {
        data: [],
        currentPage: page,
        totalPages,
        batchDate: new Date().toISOString(),
        industries,
      }
    }

    // Build query
    const query = db
      .select({
        company_id: companies.company_id,
        company_name: companies.company_name,
        industry_sector: companies.industry_sector,
        website: companies.website,
        linkedin: companies.linkedin,
        brief_summary: companies.brief_summary,
        amount_raised_usd: funding_rounds.amount_raised_usd,
        funding_stage: funding_rounds.funding_stage,
        valuation_usd: funding_rounds.valuation_usd,
        investors: funding_rounds.investors,
        snapshot_date: funding_rounds.snapshot_date,
      })
      .from(companies)
      .innerJoin(
        funding_rounds,
        eq(companies.company_id, funding_rounds.company_id)
      )

    // Build where conditions
    const whereConditions: SQL[] = [eq(funding_rounds.snapshot_date, targetDate)]

    if (filters.industry && filters.industry !== "all") {
      whereConditions.push(eq(companies.industry_sector, filters.industry))
    }

    if (filters.search) {
      whereConditions.push(sql`lower(${companies.company_name}) like ${`%${filters.search.toLowerCase()}%`}`)
    }

    // Apply where conditions
    const finalQuery = query.where(and(...whereConditions))

    // Apply sorting
    const data = await (filters.sortBy
      ? filters.sortBy === "latest_raise"
        ? finalQuery.orderBy(filters.sortDirection === "desc" 
            ? desc(funding_rounds.amount_raised_usd)
            : asc(funding_rounds.amount_raised_usd))
        : finalQuery.orderBy(filters.sortDirection === "desc"
            ? desc(companies[filters.sortBy])
            : asc(companies[filters.sortBy]))
      : finalQuery.orderBy(desc(funding_rounds.amount_raised_usd)))

    // Group and format the data
    const groupedData: Company[] = data.reduce((acc, row) => {
      const existingCompany = acc.find((c) => c.company_id === row.company_id)

      if (existingCompany) {
        existingCompany.funding_rounds.push({
          amount_raised_usd: row.amount_raised_usd,
          funding_stage: row.funding_stage,
          valuation_usd: row.valuation_usd,
          investors: row.investors,
          snapshot_date: row.snapshot_date,
        })
      } else {
        acc.push({
          company_id: row.company_id,
          company_name: row.company_name,
          industry_sector: row.industry_sector,
          website: row.website,
          linkedin: row.linkedin,
          brief_summary: row.brief_summary,
          funding_rounds: [
            {
              amount_raised_usd: row.amount_raised_usd,
              funding_stage: row.funding_stage,
              valuation_usd: row.valuation_usd,
              investors: row.investors,
              snapshot_date: row.snapshot_date,
            },
          ],
        })
      }
      return acc
    }, [] as Company[])

    return {
      data: groupedData,
      currentPage: page,
      totalPages,
      batchDate: targetDate,
      industries,
    }
  } catch (error) {
    console.error("Error fetching funding data:", error)
    throw new Error("Failed to fetch funding data")
  }
}

export async function getIndustries(): Promise<string[]> {
  const industriesResult = await db
    .select({ industry: companies.industry_sector })
    .from(companies)
    .groupBy(companies.industry_sector)
    .orderBy(asc(companies.industry_sector))

  return industriesResult.map((i) => i.industry)
}