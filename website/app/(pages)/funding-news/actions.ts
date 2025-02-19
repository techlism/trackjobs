"use server";

import { desc, eq, and, asc, sql, type SQL } from "drizzle-orm";
import db from "@/lib/database/client";
import { companies, funding_rounds } from "@/lib/database/schema";
import type { DashboardData, Company, FundingFilters } from "@/lib/types";

export async function getFundingData(filters: FundingFilters = {}): Promise<DashboardData> {
	try {
		const {
			search,
			industry,
			series,
			minValuation,
			sortBy,
			sortDirection,
			limit = 10,
			offset = 0
		} = filters;
		// Check if any filters are applied
		const hasFilters = Boolean(
			search ||
			industry ||
			(series && series.length > 0) ||
			minValuation
		);

		if (!hasFilters) {
			// UNFILTERED CASE: Get data in snapshot_date batches

			// 1. Get all distinct dates for pagination
			const dates = await db
				.select({ snapshot_date: funding_rounds.snapshot_date })
				.from(funding_rounds)
				.groupBy(funding_rounds.snapshot_date)
				.orderBy(desc(funding_rounds.snapshot_date));

			const totalBatches = dates.length;
			const batchesPerPage = 1;
			const totalPages = Math.ceil(totalBatches / batchesPerPage);
			const currentPage = Math.floor(offset / limit) + 1;

			// Get the target date for current batch
			const targetDate = dates[currentPage - 1]?.snapshot_date;
			if (!targetDate) {
				return {
					data: [],
					currentPage,
					totalPages,
					batchDate: new Date().toISOString(),
					industries: await getIndustries()
				};
			}

			// Get all companies/funding for this date
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
				.where(eq(funding_rounds.snapshot_date, targetDate))
				.orderBy(desc(funding_rounds.amount_raised_usd));

			const data = await query;

			// Group results by company
			const groupedData: Company[] = data.reduce((acc, row) => {
				const existingCompany = acc.find(c => c.company_id === row.company_id);
				if (existingCompany) {
					existingCompany.funding_rounds.push({
						amount_raised_usd: row.amount_raised_usd,
						funding_stage: row.funding_stage,
						valuation_usd: row.valuation_usd,
						investors: row.investors,
						snapshot_date: row.snapshot_date,
					});
				} else {
					acc.push({
						company_id: row.company_id,
						company_name: row.company_name,
						industry_sector: row.industry_sector,
						website: row.website,
						linkedin: row.linkedin,
						brief_summary: row.brief_summary,
						funding_rounds: [{
							amount_raised_usd: row.amount_raised_usd,
							funding_stage: row.funding_stage,
							valuation_usd: row.valuation_usd,
							investors: row.investors,
							snapshot_date: row.snapshot_date,
						}]
					});
				}
				return acc;
			}, [] as Company[]);

			return {
				data: groupedData,
				currentPage,
				totalPages,
				batchDate: targetDate,
				industries: await getIndustries()
			};

		}
		// FILTERED CASE: Search across all dates with offset/limit

		// Build query with filters
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
			);

		const whereConditions: SQL[] = [];

		if (search) {
			whereConditions.push(
				sql`${companies.company_name} LIKE '%' || ${search} || '%' COLLATE NOCASE`
			);
		}

		if (industry) {
			whereConditions.push(
				sql`${companies.industry_sector} LIKE '%' || ${industry} || '%' COLLATE NOCASE`
			);
		}

		if (series && series.length > 0) {
			whereConditions.push(
				sql`${funding_rounds.funding_stage} in ${series}`
			);
		}

		if (minValuation) {
			whereConditions.push(
				sql`${funding_rounds.valuation_usd} >= ${minValuation}`
			);
		}

		const finalQuery = query.where(and(...whereConditions));

		// Apply sorting
		const sortedQuery = (() => {
			switch (sortBy) {
				case "company_name":
					return finalQuery.orderBy(
						sortDirection === "desc"
							? desc(companies.company_name)
							: asc(companies.company_name)
					);
				case "latest_raise":
					return finalQuery.orderBy(
						sortDirection === "desc"
							? desc(funding_rounds.amount_raised_usd)
							: asc(funding_rounds.amount_raised_usd)
					);
				case "valuation":
					return finalQuery.orderBy(
						sortDirection === "desc"
							? desc(funding_rounds.valuation_usd)
							: asc(funding_rounds.valuation_usd)
					);
				case "funding_stage":
					return finalQuery.orderBy(
						sortDirection === "desc"
							? desc(funding_rounds.funding_stage)
							: asc(funding_rounds.funding_stage)
					);
				default:
					return finalQuery.orderBy(desc(funding_rounds.amount_raised_usd));
			}
		})();

		// Get total count for pagination
		const [{ count }] = await db
			.select({ count: sql<number>`count(DISTINCT ${companies.company_id})` })
			.from(companies)
			.innerJoin(
				funding_rounds,
				eq(companies.company_id, funding_rounds.company_id)
			)
			.where(and(...whereConditions));

		// Get paginated results
		const data = await sortedQuery
			.limit(limit)
			.offset(offset);

		// Group filtered results by company
		const groupedData: Company[] = data.reduce((acc, row) => {
			const existingCompany = acc.find(c => c.company_id === row.company_id);
			if (existingCompany) {
				existingCompany.funding_rounds.push({
					amount_raised_usd: row.amount_raised_usd,
					funding_stage: row.funding_stage,
					valuation_usd: row.valuation_usd,
					investors: row.investors,
					snapshot_date: row.snapshot_date,
				});
			} else {
				acc.push({
					company_id: row.company_id,
					company_name: row.company_name,
					industry_sector: row.industry_sector,
					website: row.website,
					linkedin: row.linkedin,
					brief_summary: row.brief_summary,
					funding_rounds: [{
						amount_raised_usd: row.amount_raised_usd,
						funding_stage: row.funding_stage,
						valuation_usd: row.valuation_usd,
						investors: row.investors,
						snapshot_date: row.snapshot_date,
					}]
				});
			}
			return acc;
		}, [] as Company[]);

		const totalPages = Math.ceil(count / limit);
		const currentPage = Math.floor(offset / limit) + 1;

		return {
			data: groupedData,
			currentPage,
			totalPages,
			batchDate: groupedData[0]?.funding_rounds[0]?.snapshot_date || new Date().toISOString(),
			industries: await getIndustries()
		};
	} catch (error) {
		console.error("Error fetching funding data:", error);
		throw new Error("Failed to fetch funding data");
	}
}

export async function getIndustries(): Promise<string[]> {
	const industriesResult = await db
		.select({ industry: companies.industry_sector })
		.from(companies)
		.groupBy(companies.industry_sector)
		.orderBy(asc(companies.industry_sector));

	return industriesResult.map((i) => i.industry);
}
