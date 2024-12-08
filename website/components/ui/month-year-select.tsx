"use client";
import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { Info } from "lucide-react";

interface MonthYearSelectProps {
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function MonthYearSelect({
	value,
	onChange,
	// placeholder = "Select Date",
	className,
}: MonthYearSelectProps) {
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 56 }, (_, i) =>
		(currentYear - 50 + i).toString(),
	).reverse();

	const [isPresent, setIsPresent] = useState<boolean>(() => {
		return value === "Present";
	});

	const [selectedMonth, setSelectedMonth] = useState<string>(() => {
		if (!value || value === "Present") return "";
		const [month] = value.split(" ");
		return months.includes(month) ? month : "";
	});

	const [selectedYear, setSelectedYear] = useState<string>(() => {
		if (!value || value === "Present") return "";
		const [, year] = value.split(" ");
		return year || "";
	});

	const handleMonthChange = (month: string) => {
		setSelectedMonth(month);
		if (selectedYear) {
			const monthIndex = (months.indexOf(month) + 1)
				.toString()
				.padStart(2, "0");
			onChange?.(`${month} ${selectedYear}`);
		}
	};

	const handleYearChange = (year: string) => {
		setSelectedYear(year);
		if (selectedMonth) {
			const monthIndex = (months.indexOf(selectedMonth) + 1)
				.toString()
				.padStart(2, "0");
			onChange?.(`${selectedMonth} ${year}`);
		}
	};

	const handlePresentToggle = (checked: boolean) => {
		setIsPresent(checked);
		if (checked) {
			setSelectedMonth("");
			setSelectedYear("");
			onChange?.("Present");
		} else {
			// Reset to empty or previous selection
			onChange?.("");
		}
	};

	return (
		<div className="space-y-4  p-2 border rounded-md">
			<div className={`flex gap-2 ${className}`}>
				<Select
					value={selectedMonth}
					onValueChange={handleMonthChange}
					disabled={isPresent}
				>
					<SelectTrigger>
						<SelectValue placeholder="Month" className="font-medium text-sm" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{months.map((month) => (
								<SelectItem key={month} value={month}>
									{month}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>

				<Select
					value={selectedYear}
					onValueChange={handleYearChange}
					disabled={isPresent}
				>
					<SelectTrigger>
						<SelectValue placeholder="Year" className="font-medium text-sm" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{years.map((year) => (
								<SelectItem key={year} value={year}>
									{year}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>

			<div className="flex items-center space-x-2">
				<Switch
					id="present-mode"
					checked={isPresent}
					onCheckedChange={handlePresentToggle}
				/>
				<Label htmlFor="present-mode">Present</Label>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Info size={16} />
						</TooltipTrigger>
						<TooltipContent>
							Avoid selecting Present as your starting date
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</div>
	);
}
