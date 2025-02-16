"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowUpDown, Globe, LinkedinIcon, ChevronsUpDown, Info } from "lucide-react";
import { DataToolbar } from "./data-toolbar";
import { InvestorBadges } from "./investor-badges";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Company, DashboardData } from "@/lib/types";

const formatCurrency = (amount: number | null) => {
  if (!amount) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

type SortConfig = {
  key: keyof Company | "latest_raise" | "valuation";
  direction: "asc" | "desc";
};

export default function DashboardClient({
  data,
  currentPage,
  totalPages,
  batchDate,
}: DashboardData) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "company_name",
    direction: "asc",
  });
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  const industries = useMemo(() => {
    return Array.from(new Set(data.map((company) => company.industry_sector))).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    return data
      .filter((company) => {
        const matchesSearch = company.company_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesIndustry =
          selectedIndustry === "all" || company.industry_sector === selectedIndustry;
        return matchesSearch && matchesIndustry;
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
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return 0;
      });
  }, [data, searchQuery, selectedIndustry, sortConfig, batchDate]);

  const handleSort = (key: SortConfig["key"]) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/dashboard?page=${newPage}`);
  };

  return (
    <div className="grid grid-cols-1 gap-4 mx-auto max-w-7xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Funding Dashboard</CardTitle>
          <CardDescription>
            Showing funding data for batch: {formatDate(batchDate)}
			<br/>
			This dataset focuses on tracking notable investment activity and may not encompass all market transactions. The selection prioritizes prominent companies demonstrating significant market presence, though comprehensive coverage of all entities remains challenging due to data availability constraints.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataToolbar
            industries={industries}
            selectedIndustry={selectedIndustry}
            onIndustryChange={setSelectedIndustry}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardContent className="p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead >
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
                <TableHead>Stage</TableHead>
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
            <Collapsible
              key={company.company_id}
              asChild
              open={isExpanded}
              onOpenChange={(open) => hasSummary && setExpandedCompany(open ? company.company_id : null)}
            >
              <>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <CollapsibleTrigger asChild disabled={!hasSummary}>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!hasSummary}
                        >
                          <ChevronsUpDown
                            className={`h-4 w-4 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            } ${!hasSummary ? "text-muted-foreground/50" : ""}`}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      {company.company_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{company.industry_sector}</Badge>
                  </TableCell>
                  <TableCell className="flex justify-center items-center">
                    {formatCurrency(relevantFundingRound?.amount_raised_usd)}
                  </TableCell>
                  <TableCell>
                    {relevantFundingRound?.funding_stage || "N/A"}
                  </TableCell>
                  <TableCell>
                    <InvestorBadges investors={relevantFundingRound?.investors} />
                  </TableCell>
				  <TableCell className="flex justify-center items-center">
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

                {hasSummary && (
                  <CollapsibleContent asChild>
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
                  </CollapsibleContent>
                )}
              </>
            </Collapsible>
          );
        })}
      </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-2">
        <Button
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={currentPage >= totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}