import { Suspense } from "react"
import { getFundingData, getIndustries } from "./actions"
import DashboardClient from "@/components/funding-news/dashboard-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Company } from "@/lib/types" 

type SortableCompanyKeys = Exclude<keyof Company, 'funding_rounds'> | 'latest_raise';

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
              // biome-ignore lint/suspicious/noArrayIndexKey: Good Enough to be here.
              <div key={`skeleton_${i}`} className="flex items-center space-x-4">
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
  )
}



async function DashboardContent({
  page,
  industry,
  search,
  sortBy,
  sortDirection,
}: {
  page: number
  industry?: string
  search?: string
  sortBy?: string
  sortDirection?: "asc" | "desc"
}) {
  const [fundingData, industries] = await Promise.all([
    getFundingData(page, {
      industry,
      search,
      sortBy: sortBy as SortableCompanyKeys,
      sortDirection,
    }),
    getIndustries(),
  ])

  if (!fundingData.batchDate) {
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
    )
  }

  return <DashboardClient {...fundingData} industries={industries} />
}


export default async function DashboardPage({
  params,
}: {
  params: Promise<{
    page?: string
    industry?: string
    search?: string
    sortBy?: string
    sortDirection?: "asc" | "desc"
  }>
}) {
  const searchParams = await params;
  const page = searchParams.page ? Number.parseInt(searchParams.page) : 1

  return (
    <main className="container mx-auto my-6">
      <Suspense fallback={<LoadingState />}>
        <DashboardContent
          page={page}
          industry={searchParams.industry}
          search={searchParams.search}
          sortBy={searchParams.sortBy}
          sortDirection={searchParams.sortDirection}
        />
      </Suspense>
    </main>
  )
}
