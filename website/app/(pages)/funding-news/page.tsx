import { getFundingData } from "./actions";
import DashboardClient from "@/components/funding-news/dashboard-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardData } from "@/lib/types";

// Default values for pagination
const DEFAULT_LIMIT = 10;

function LoadingState() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            <Skeleton className="h-8 w-[200px]" />
          </CardTitle>
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={`funding_skeleton_${i}`} 
                className="flex items-center space-x-4"
              >
                <Skeleton className="h-12 w-[200px]" />
                <Skeleton className="h-12 w-[100px]" />
                <Skeleton className="h-12 w-[150px]" />
                <Skeleton className="h-12 w-[100px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function DashboardContent({
  page,
  industry,
  search,
  sortBy,
  sortDirection,
  stages,
  minValuation,
  limit = DEFAULT_LIMIT,
}: {
  page: number;
  industry?: string;
  search?: string;
  sortBy?: "company_name" | "latest_raise" | "valuation" | "funding_stage";
  sortDirection?: "asc" | "desc";
  stages?: string;
  minValuation?: string;
  limit?: number;
}) {
  try {
    const offset = (page - 1) * limit;
    
    const fundingData = await getFundingData({
      industry,
      search,
      sortBy,
      sortDirection,
      series: stages?.split(','),
      minValuation: minValuation ? Number(minValuation) : undefined,
      limit,
      offset,
    });

    // Check if we have data (commenting this part)
    // if (!fundingData.data.length) {
    //   return (
    //     <Card>
    //       <CardContent className="p-6">
    //         <div className="text-center">
    //           <h2 className="text-lg font-semibold">No Results Found</h2>
    //           <p className="text-muted-foreground">
    //             Try adjusting your filters to see more results.
    //           </p>
    //         </div>
    //       </CardContent>
    //     </Card>
    //   );
    // }

    return <DashboardClient {...fundingData} />;
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Error Loading Data</h2>
            <p className="text-muted-foreground">
              There was a problem loading the funding data. Please try again later.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    industry?: string;
    search?: string;
    sortBy?: "company_name" | "latest_raise" | "valuation" | "funding_stage";
    sortDirection?: "asc" | "desc";
    stages?: string;
    minValuation?: string;
    limit?: string;
  }>;
}) {
  const params = await searchParams;

  // Parse and validate parameters
  const page = params.page ? Math.max(1, Number.parseInt(params.page)) : 1;
  const limit = params.limit ? Math.max(1, Number.parseInt(params.limit)) : DEFAULT_LIMIT;

  // Validate sortBy to ensure it matches our allowed values
  const validSortByValues = ["company_name", "latest_raise", "valuation", "funding_stage"] as const;
  const sortBy = params.sortBy && validSortByValues.includes(params.sortBy)
    ? params.sortBy
    : undefined;

  return (
    <main className="container mx-auto my-6">
      <DashboardContent
        page={page}
        limit={limit}
        industry={params.industry}
        search={params.search}
        sortBy={sortBy}
        sortDirection={params.sortDirection}
        stages={params.stages}
        minValuation={params.minValuation}
      />
    </main>
  );
}