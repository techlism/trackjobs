import { Badge } from "@/components/ui/badge"

interface InvestorBadgesProps {
  investors: string | null
}

export function InvestorBadges({ investors }: InvestorBadgesProps) {
  if (!investors) return <span className="text-muted-foreground">Investor&apos;s data not available</span>

  return (
    <div className="flex flex-wrap gap-1">
      {investors.split(",").map((investor, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <Badge key={index} variant="secondary" className="max-w-[200px] truncate">
          {investor.trim()}
        </Badge>
      ))}
    </div>
  )
}

