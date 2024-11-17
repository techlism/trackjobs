// components/ResumeSection.tsx
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";
import { Plus, Trash, AlertCircle, ChevronUp, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/utils";
import {
	type SectionField,
	type SectionItemData,
	SectionFieldType,
} from "@/lib/types";
import { MonthYearSelect } from "../ui/month-year-select";

interface SectionProps {
	title: string;
	description?: string;
	fields: SectionField[];
	values: SectionItemData[];
	onChange: (values: SectionItemData[]) => void;
	canAddMore?: boolean;
	minItems?: number;
	maxItems?: number;
	onRemoveSection?: () => void;
}

export function Section({
	title,
	description,
	fields,
	values,
	onChange,
	canAddMore = true,
	minItems = 1,
	maxItems = 10,
	onRemoveSection,
}: SectionProps) {
	const [isExpanded, setIsExpanded] = useState(true);
	const [touchedFields, setTouchedFields] = useState<
		Record<string, Record<string, boolean>>
	>({});

	const markFieldAsTouched = (itemId: string, fieldName: string) => {
		setTouchedFields((prev) => ({
			...prev,
			[itemId]: {
				...(prev[itemId] || {}),
				[fieldName]: true,
			},
		}));
	};

	const isFieldInvalid = (
		itemId: string,
		field: SectionField,
		value: unknown,
	) => {
		const isTouched = touchedFields[itemId]?.[field.name];
		if (!field.required || !isTouched) return false;

		if (typeof value === "string") {
			return value.trim() === "";
		}
		if (Array.isArray(value)) {
			return value.length === 0;
		}
		if (typeof value === "object" && value !== null) {
			return Object.keys(value).length === 0;
		}
		return true;
	};

	const handleAddItem = () => {
		if (values.length >= maxItems) return;
		const newItem: SectionItemData = {
			id: crypto.randomUUID(),
			fields: fields.reduce(
				(acc, field) => {
					acc[field.name] =
							field.type === "link" ||
									field.type === "text" ||
									field.type === "textarea"
								? ""
								: "";
					return acc;
				},
				{} as SectionItemData["fields"],
			),
		};
		onChange([...values, newItem]);
	};

	const handleRemoveItem = (index: number) => {
		if (values.length <= minItems) return;
		onChange(values.filter((_, i) => i !== index));
	};

	const handleFieldChange = (
		index: number,
		fieldName: string,
		value: string | string[] | { value: string | string[]; type: "date" | "text" | "textarea" | "link"},
	) => {
		const newValues = values.map((item, i) =>
			i === index
				? {
						...item,
						fields: {
							...item.fields,
							[fieldName]: value,
						},
					}
				: item,
		);
		onChange(newValues);
	};

	const renderField = (
		item: SectionItemData,
		index: number,
		field: SectionField,
	) => {
		const value = item.fields[field.name];
		const isInvalid = isFieldInvalid(item.id, field, value);

		return (
			<div
				key={`${item.id}-${field.name}`}
				className={cn(
					field.fullWidth
						? "lg:col-span-2 md:col-span-2 sm:col-span-2 col-span-1"
						: "col-span-1",
				)}
			>
				<Label>
					{field.label}
					{field.required && <span className="text-red-500">*</span>}
				</Label>
				<div className="relative">
					{field.type === "textarea" ? (
						<Textarea
							placeholder={field.placeholder}
							value={value as string}
							onChange={(e) =>
								handleFieldChange(index, field.name, e.target.value)
							}
							onBlur={() => markFieldAsTouched(item.id, field.name)}
							className={isInvalid ? "border-red-500 focus:ring-red-500" : ""}
						/>
					) : field.type === "date" ? (
						<MonthYearSelect
							value={value as string}
							onChange={(date) =>handleFieldChange(index, field.name, date)}
						/>
					) : (
						<Input
							type={field.type === "link" ? "url" : "text"}
							placeholder={field.placeholder}
							value={value as string}
							onChange={(e) =>
								handleFieldChange(index, field.name, e.target.value)
							}
							onBlur={() => markFieldAsTouched(item.id, field.name)}
							className={isInvalid ? "border-red-500 focus:ring-red-500" : ""}
						/>
					)}
					{isInvalid && (
						<div className="absolute inset-y-0 right-0 pr-3 flex items-center">
							<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<AlertCircle className="h-4 w-4 text-red-500" />
								</TooltipTrigger>
								<TooltipContent>
									<p>This field is required.</p>
								</TooltipContent>
							</Tooltip>
							</TooltipProvider>
						</div>
					)}
				</div>
			</div>
		);
	};

	return (
		<Card className="w-full">
			<CardHeader className="flex flex-row justify-between">
				<div>
					<CardTitle className="text-lg font-semibold">{title}</CardTitle>
					{description && (
						<p className="text-sm text-muted-foreground">{description}</p>
					)}
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsExpanded(!isExpanded)}
						aria-label={isExpanded ? "Collapse" : "Expand"}
					>
						{isExpanded ? (
							<ChevronUp className="h-5 w-5" />
						) : (
							<ChevronDown className="h-5 w-5" />
						)}
					</Button>
					{onRemoveSection && (
						<Button
							variant="ghost"
							size="icon"
							onClick={onRemoveSection}
							className="text-destructive hover:border-destructive hover:border hover:bg-transparent hover:text-destructive hover:shadow-sm transition-all"
							aria-label="Remove Section"
						>
							<Trash className="h-5 w-5" />
						</Button>
					)}
				</div>
			</CardHeader>
			<AnimatePresence initial={false}>
				{isExpanded && (
					<motion.div
						key="content"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						<CardContent className="space-y-4">
							{values.map((item, index) => (
								<div
									key={item.id}
									className="space-y-4 p-4 border rounded-md bg-muted/20 relative"
								>
									{canAddMore && values.length > minItems && (
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleRemoveItem(index)}
											className="absolute top-2 right-2 text-destructive"
											aria-label="Remove Item"
										>
											<Trash className="h-4 w-4" />
										</Button>
									)}
									<div className="grid grid-cols-2 gap-4">
										{fields.map((field) => renderField(item, index, field))}
									</div>
								</div>
							))}
							{canAddMore && values.length < maxItems && (
								<Button
									variant="outline"
									size="sm"
									onClick={handleAddItem}
									className="w-full"
								>
									<Plus className="h-4 w-4 mr-2" />
									Add {title}
								</Button>
							)}
						</CardContent>
					</motion.div>
				)}
			</AnimatePresence>
		</Card>
	);
}
