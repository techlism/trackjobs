"use client";

import { useState, useMemo, Fragment, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	ArrowUpDown,
	Globe,
	LinkedinIcon,
	ChevronsUpDown,
	Info,
	ChevronRight,
	ChevronLeft
} from "lucide-react";
import { DataToolbar } from "./data-toolbar";
import { InvestorBadges } from "./investor-badges";
import type { Company, DashboardData, FundingFilters } from "@/lib/types";
import NoResultsCard from "./no-result-card";


const fundingStageOrder = [
	"Pre-Seed",
	"Angel",
	"Seed",
	"Series A",
	"Series B",
	"Series C",
	"Series D",
	"Series E",
	"Series F",
	"Growth",
	"Debt",
	"Not Available",
];

const formatCurrency = (amount: number | null) => {
	if (!amount) return "N/A";
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		notation: "compact",
		maximumFractionDigits: 1,
	}).format(amount);
};

const formatDate = (batchDate: string, tMinus = 0) => {
	const date = new Date(batchDate);
	date.setDate(date.getDate() - tMinus);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

// Default filter state
const defaultFilters: Required<FundingFilters> = {
	search: "",
	industry: "all",
	series: [],
	minValuation: 0,
	sortBy: "company_name",
	sortDirection: "asc",
	limit: 10,
	offset: 0,
};

type SortConfig = {
	key: keyof Company | "latest_raise" | "valuation" | "funding_stage";
	direction: "asc" | "desc";
};



export default function DashboardClient({
	data,
	currentPage,
	totalPages,
	batchDate,
}: DashboardData) {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Initialize with default values
	const [filterState, setFilterState] = useState<Required<FundingFilters>>(defaultFilters);
	const [pendingFilters, setPendingFilters] = useState<Required<FundingFilters>>(defaultFilters);

	const [isGlobalSearch, setIsGlobalSearch] = useState(false);
	const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

	const [sortConfig, setSortConfig] = useState<SortConfig>({
		key: "company_name",
		direction: "asc",
	});

	const industries = useMemo(() => {
		return Array.from(new Set(data.map((company) => company.industry_sector))).sort();
	}, [data]);

	const industryFrequency = useMemo(() => {
		const frequencyMap = new Map<string, number>();
		// biome-ignore lint/complexity/noForEach: <explanation>
		data.forEach((company) => {
			const industry = company.industry_sector;
			frequencyMap.set(industry, (frequencyMap.get(industry) || 0) + 1);
		});
		return Array.from(frequencyMap.entries()).map(([industry, count]) => ({
			name: industry,
			value: count,
		}));
	}, [data]);


	const handleGlobalSearchToggle = useCallback(() => {
		setIsGlobalSearch(prev => !prev);
		// Only reset filters if turning global search on
		if (!isGlobalSearch) {
			setPendingFilters(defaultFilters);
			setFilterState(defaultFilters);
		}
	}, [isGlobalSearch]);

	const handlePageChange = useCallback((newPage: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set('page', newPage.toString());
		router.push(`/funding-news?${params.toString()}`);
	}, [router, searchParams]);

	const resetFilters = useCallback(() => {
		const defaultFilters: Required<FundingFilters> = {
			search: "",
			industry: "all",
			series: [],
			minValuation: 0,
			sortBy: "company_name",
			sortDirection: "asc",
			limit: 10,
			offset: 0,
		};

		setPendingFilters(defaultFilters);
		setFilterState(defaultFilters);

		const validURLParams = Boolean(
			searchParams.get("search") ||
			searchParams.get("industry") !== "all" ||
			searchParams.get("stages") ||
			searchParams.get("minValuation") ||
			searchParams.get("sortBy")
		);

		if (isGlobalSearch || validURLParams) {
			// Keep only the page parameter if it exists
			const page = searchParams.get("page");
			if (page) {
				router.push(`/funding-news?page=${page}`);
			} else {
				router.push("/funding-news");
			}

			// Reset the global search state after navigation
			setIsGlobalSearch(false);
		}
	}, [isGlobalSearch, router, searchParams]);

	// Modify the applyFilters function to handle empty states better
	const applyFilters = useCallback(() => {
		if (isGlobalSearch) {
			const params = new URLSearchParams();

			// Only add non-empty/non-default values to the URL
			if (pendingFilters.search) {
				params.set("search", pendingFilters.search);
			}
			if (pendingFilters.industry !== "all") {
				params.set("industry", pendingFilters.industry);
			}
			if (pendingFilters.series.length > 0) {
				params.set("stages", pendingFilters.series.join(","));
			}
			if (pendingFilters.minValuation > 0) {
				params.set("minValuation", pendingFilters.minValuation.toString());
			}
			if (pendingFilters.sortBy !== "company_name") {
				params.set("sortBy", pendingFilters.sortBy);
				params.set("sortDirection", pendingFilters.sortDirection);
			}

			// Preserve the page parameter if it exists (Nope, it is not required to be preserved, I guess)
			// const page = searchParams.get("page");
			// if (page) {
			// 	params.set("page", page);
			// }

			// Only append the query string if there are parameters
			const queryString = params.toString();
			router.push(`/funding-news${queryString ? `?${queryString}` : ''}`);
		} else {
			setFilterState(pendingFilters);
		}
	}, [pendingFilters, isGlobalSearch, router]);

	const filteredData = useMemo(() => {
		// if (isGlobalSearch) return data;

		return data
			.filter((company) => {
				const matchesSearch = company.company_name
					.toLowerCase()
					.includes(filterState.search.toLowerCase());

				const matchesIndustry =
					filterState.industry === "all" || company.industry_sector === filterState.industry;

				const matchesSeries =
					!filterState.series.length ||
					company.funding_rounds.some((round) =>
						filterState.series.includes(round.funding_stage)
					);

				const companyValuation = company.funding_rounds[0]?.valuation_usd;
				const matchesValuation =
					!filterState.minValuation ||
					(companyValuation && companyValuation >= filterState.minValuation);

				return matchesSearch && matchesIndustry && matchesSeries && matchesValuation;
			})
			.map((company) => ({
				...company,
				funding_rounds: company.funding_rounds.filter(
					(round) => round.snapshot_date === batchDate
				),
			}))
			.sort((a, b) => {
				if (sortConfig.key === "latest_raise") {
					const aValue = a.funding_rounds[0]?.amount_raised_usd || 0;
					const bValue = b.funding_rounds[0]?.amount_raised_usd || 0;
					return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
				}

				if (sortConfig.key === "valuation") {
					const aValue = a.funding_rounds[0]?.valuation_usd;
					const bValue = b.funding_rounds[0]?.valuation_usd;
					if (aValue === null && bValue === null) return 0;
					if (aValue === null) return 1;
					if (bValue === null) return -1;
					return sortConfig.direction === "asc"
						? (aValue || 0) - (bValue || 0)
						: (bValue || 0) - (aValue || 0);
				}

				if (sortConfig.key === "funding_stage") {
					const aStage = a.funding_rounds[0]?.funding_stage || "Not Available";
					const bStage = b.funding_rounds[0]?.funding_stage || "Not Available";
					const aIndex = fundingStageOrder.indexOf(aStage);
					const bIndex = fundingStageOrder.indexOf(bStage);
					return sortConfig.direction === "asc" ? aIndex - bIndex : bIndex - aIndex;
				}

				// Default case for company_name
				return sortConfig.direction === "asc"
					? a.company_name.localeCompare(b.company_name)
					: b.company_name.localeCompare(a.company_name);
			});
	}, [data, filterState, sortConfig, batchDate]);


	const handleSort = (key: SortConfig["key"]) => {
		setSortConfig((current) => ({
			key,
			direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
		}));
	};



	return (
		<div className="grid grid-cols-1 gap-4 mx-auto max-w-7xl">
			<Card className="w-full">
				<CardHeader>
					<CardTitle className="text-2xl">Funding Dashboard</CardTitle>
					<CardDescription>
						Showing data for approximately {formatDate(batchDate, 10)} to{" "}
						{formatDate(batchDate, 1)}
						<br/>
						This dataset tracks major investment activities, focusing on prominent companies with a significant market presence. It may not cover all transactions due to limited data availability.
						<br/>
						Also, this data is currently limited to 🇮🇳 only.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<DataToolbar
						industries={industries}
						selectedIndustry={pendingFilters.industry ?? 'all'}
						onIndustryChange={(value) =>
							setPendingFilters((prev) => ({ ...prev, industry: value }))
						}
						searchQuery={pendingFilters.search || ""}
						onSearchChange={(value) =>
							setPendingFilters((prev) => ({ ...prev, search: value }))
						}
						industryFrequency={industryFrequency}
						selectedSeries={pendingFilters.series || []}
						onSeriesChange={(value) =>
							setPendingFilters((prev) => ({ ...prev, series: value }))
						}
						valuationRange={[pendingFilters.minValuation || 0, Number.POSITIVE_INFINITY]}
						onValuationRangeChange={([min]) =>
							setPendingFilters((prev) => ({ ...prev, minValuation: min }))
						}
						isGlobalSearch={isGlobalSearch}
						onGlobalSearchToggle={handleGlobalSearchToggle}
						fundingStages={fundingStageOrder}
						onApplyFilters={applyFilters}
						onResetFilters={resetFilters}
						hasResults={filteredData.length > 0}
					/>
				</CardContent>
			</Card>

			<Card className="w-full">
				<CardContent className="p-2">
					{filteredData.length === 0 ? (
						<NoResultsCard onReset={resetFilters} />
					) : (

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>
										<Button
											variant="ghost"
											onClick={() => handleSort("company_name")}
											className="flex items-center gap-1"
										>
											Company
											<ArrowUpDown className="h-4 w-4" />
										</Button>
									</TableHead>
									<TableHead>Industry</TableHead>
									<TableHead>
										<Button
											variant="ghost"
											onClick={() => handleSort("latest_raise")}
											className="flex items-center gap-1"
										>
											Latest Raise
											<ArrowUpDown className="h-4 w-4" />
										</Button>
									</TableHead>
									<TableHead>
										<Button
											variant="ghost"
											onClick={() => handleSort("funding_stage")}
											className="flex items-center gap-1"
										>
											Stage
											<ArrowUpDown className="h-4 w-4" />
										</Button>
									</TableHead>
									<TableHead>Investors</TableHead>
									<TableHead>
										<Button
											variant="ghost"
											onClick={() => handleSort("valuation")}
											className="flex items-center gap-1"
										>
											Valuation
											<ArrowUpDown className="h-4 w-4" />
										</Button>
									</TableHead>
									<TableHead>Links</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredData.map((company) => {
									const hasSummary = !!company.brief_summary;
									const isExpanded = expandedCompany === company.company_id;
									const relevantFundingRound = company.funding_rounds[0];

									return (
										<Fragment key={company.company_id}>
											<TableRow>
												<TableCell className="font-medium">
													<div className="flex items-center gap-2">
														<Button
															variant="ghost"
															size="icon"
															onClick={() => setExpandedCompany(
																isExpanded ? null : company.company_id
															)}
															disabled={!hasSummary}
															className={!hasSummary ? "opacity-50 cursor-not-allowed" : ""}
														>
															<ChevronsUpDown
																className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
															/>
														</Button>
														{company.company_name}
													</div>
												</TableCell>
												<TableCell>
													<Badge variant="secondary">{company.industry_sector}</Badge>
												</TableCell>
												<TableCell className="text-center">
													{formatCurrency(relevantFundingRound?.amount_raised_usd)}
												</TableCell>
												<TableCell>
													{relevantFundingRound?.funding_stage || "N/A"}
												</TableCell>
												<TableCell>
													<InvestorBadges investors={relevantFundingRound?.investors} />
												</TableCell>
												<TableCell className="text-center">
													{relevantFundingRound?.valuation_usd
														? formatCurrency(relevantFundingRound.valuation_usd)
														: "N/A"}
												</TableCell>
												<TableCell>
													<div className="flex space-x-2">
														{company.website && (
															<a
																href={company.website}
																target="_blank"
																rel="noopener noreferrer"
																className="text-primary/90 hover:text-primary/80"
															>
																<Globe className="h-5 w-5" />
																<span className="sr-only">Website</span>
															</a>
														)}
														{company.linkedin && (
															<a
																href={company.linkedin}
																target="_blank"
																rel="noopener noreferrer"
																className="text-primary/90 hover:text-primary/80"
															>
																<LinkedinIcon className="h-5 w-5" />
																<span className="sr-only">LinkedIn</span>
															</a>
														)}
													</div>
												</TableCell>
											</TableRow>
											{isExpanded && hasSummary && (
												<TableRow className="bg-muted/10">
													<TableCell colSpan={7} className="p-4">
														<div className="flex items-start gap-4">
															<Info className="h-4 w-4 text-muted-foreground mt-1" />
															<div>
																<p className="text-sm font-medium text-foreground mb-1">
																	Company Summary
																</p>
																<p className="text-sm text-muted-foreground">
																	{company.brief_summary}
																</p>
															</div>
														</div>
													</TableCell>
												</TableRow>
											)}
										</Fragment>
									);
								})}
							</TableBody>
						</Table>)}
				</CardContent>
			</Card>

			<div className="flex justify-center space-x-2">
				<Button
					variant="outline"
					disabled={currentPage <= 1}
					onClick={() => handlePageChange(currentPage - 1)}
				>
					<ChevronLeft />
					Previous
				</Button>
				<Button
					variant="outline"
					disabled={currentPage >= totalPages}
					onClick={() => handlePageChange(currentPage + 1)}
				>
					Next
					<ChevronRight />
				</Button>
			</div>
		</div>
	);
}
