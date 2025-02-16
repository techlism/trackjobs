// app/dashboard/page.tsx
import { Suspense } from "react"
import { getFundingData } from "./actions"
import DashboardClient from "@/components/funding-news/dashboard-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Company, DashboardData } from "@/lib/types" 

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
            // biome-ignore lint/suspicious/noArrayIndexKey: It is sufficiently unique
              <div key={`funding_skeleton_${i}`} className="flex items-center space-x-4">
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
  sortBy?: SortableCompanyKeys
  sortDirection?: "asc" | "desc"
}) {
  try {
    const fundingData = await getFundingData(page, {
      industry,
      search,
      sortBy,
      sortDirection,
    })

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

    return <DashboardClient {...fundingData} industries={fundingData.industries}/>

  } catch (error) {
    console.error("Error loading dashboard data:", error)
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
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{
    page?: string
    industry?: string
    search?: string
    sortBy?: SortableCompanyKeys
    sortDirection?: "asc" | "desc"
  }>
}) {
  const params = await searchParams;

  const page = params.page ? Number.parseInt(params.page) : 1;

  return (
    <main className="container mx-auto my-6">
      <Suspense key={JSON.stringify(searchParams)} fallback={<LoadingState />}>
        <DashboardContent
          page={page}
          industry={params.industry}
          search={params.search}
          sortBy={params.sortBy}
          sortDirection={params.sortDirection}
        />
      </Suspense>
    </main>
  )
}