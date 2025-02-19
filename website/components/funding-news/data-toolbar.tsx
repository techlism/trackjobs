"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipProps } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label as FormLabel } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";

interface DataToolbarProps {
	industries: string[];
	selectedIndustry: string | "all";
	onIndustryChange: (value: string) => void;
	searchQuery: string;
	onSearchChange: (value: string) => void;
	industryFrequency: {
		name: string;
		value: number;
	}[];
	selectedSeries: string[];
	onSeriesChange: (value: string[]) => void;
	valuationRange: [number, number];
	onValuationRangeChange: (value: [number, number]) => void;
	isGlobalSearch: boolean;
	onGlobalSearchToggle: () => void;
	fundingStages: string[];
	onApplyFilters: () => void;
	onResetFilters: () => void;
	hasResults: boolean;
}

export function DataToolbar({
	industries,
	selectedIndustry,
	onIndustryChange,
	searchQuery,
	onSearchChange,
	industryFrequency,
	selectedSeries,
	onSeriesChange,
	valuationRange,
	onValuationRangeChange,
	isGlobalSearch,
	onGlobalSearchToggle,
	fundingStages = [],
	onApplyFilters,
	onResetFilters,
	hasResults,
}: DataToolbarProps) {
	const chartConfig = {
		value: {
			label: "Companies",
			color: "#460af9",
		},
	} satisfies ChartConfig;

	const CustomTooltip = ({
		active,
		payload
	}: TooltipProps<ValueType, NameType>) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-background border p-2 rounded-lg shadow-sm">
					<p className="font-medium">{payload[0].payload.name}</p>
					<p className="text-sm">{`Companies: ${payload[0].value}`}</p>
				</div>
			);
		}
		return null;
	};

	const formatCurrency = (amount: number | null) => {
		if (!amount) return "N/A";
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			notation: "compact",
			maximumFractionDigits: 1,
		}).format(amount);
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="w-full space-y-4">
					{/* Main filters grid - stacks on mobile, 2 columns on tablet, 3 columns on desktop */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{/* Search input - full width on mobile */}
						<div className="relative">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search companies..."
								value={searchQuery}
								onChange={(e) => onSearchChange(e.target.value)}
								className="w-full pl-9 h-10"
							/>
						</div>

						{/* Industry Select - full width on mobile */}
						<div className="w-full">
							<Select value={selectedIndustry} onValueChange={onIndustryChange}>
								<SelectTrigger className="w-full h-10">
									<SelectValue placeholder="Select Industry" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Industries</SelectItem>
									{industries.map((industry) => (
										<SelectItem key={industry} value={industry}>
											{industry}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Funding Stages Multi-select - full width on mobile */}
						<div className="w-full">
							<MultiSelect
								options={fundingStages.map(stage => ({
									value: stage,
									label: stage
								}))}
								selected={selectedSeries}
								onChange={onSeriesChange}
								placeholder="Select Stages"
								className="w-full h-10"
							/>
						</div>
					</div>

					{/* Actions row - stacks on mobile, splits into two sections on larger screens */}
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						{/* Global search toggle */}
						<div className="flex items-center space-x-3">
							<FormLabel className="text-sm font-medium cursor-pointer m-0">
								Global Search
							</FormLabel>
							<Switch
								checked={isGlobalSearch}
								onCheckedChange={onGlobalSearchToggle}
							/>
						</div>

						{/* Action buttons */}
						<div className="flex items-center gap-3 w-full sm:w-auto">
							<Button
								onClick={onApplyFilters}
								className="flex-1 sm:flex-none"
							>
								Apply Filters
							</Button>
							<Button
								variant="outline"
								onClick={onResetFilters}
								className="flex-1 sm:flex-none"
							>
								<RotateCcw className="h-4 w-4 mr-2" />
								Reset Filters
							</Button>
						</div>
					</div>
				</div>
			</div>

			{!hasResults && (
				<div className="flex justify-center items-center p-4 bg-muted/50 rounded-lg">
					<p className="text-muted-foreground">No results found. Try adjusting your filters or enable Global Search.</p>
				</div>
			)}

			<div className="flex flex-col gap-4">
				{industryFrequency.length > 0 &&
					<div className="flex justify-between items-center">
						<p className="font-medium text-sm">Sector-wise fund raising trends</p>
					</div>
				}
				{industryFrequency.length > 0 &&
					<ResponsiveContainer width="100%" height={250} className="rounded-lg">
						<LineChart
							data={industryFrequency}
						>
							<CartesianGrid strokeDasharray="4 4" />

							<Tooltip content={<CustomTooltip />} />
							<Line
								type="monotone"
								dataKey="value"
								stroke={chartConfig.value.color}
								strokeWidth={2}
								activeDot={{ r: 8 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				}

				<div className="flex flex-col gap-2">
					<div className="flex justify-between items-center">
						<FormLabel>Minimum Valuation</FormLabel>
					</div>
					<Slider
						value={[valuationRange[0]]}
						onValueChange={([value]) => onValuationRangeChange([value, Number.POSITIVE_INFINITY])}
						min={0}
						max={1000000000}
						step={1000000}
						className="mb-2"
					/>
					<div className="text-sm text-muted-foreground">
						{valuationRange[0] === 0
							? "No minimum valuation filter applied"
							: `Showing companies valued at or above ${formatCurrency(valuationRange[0])}`
						}
					</div>
				</div>
			</div>
		</div>
	);
}