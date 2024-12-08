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
	type SectionFieldData,
	SectionFieldType,
} from "@/lib/types";
import { MonthYearSelect } from "../ui/month-year-select";
import React from "react";

// ResumeSection.tsx
interface SectionProps {
	title: string;
	description?: string;
	fields: SectionFieldData[];
	values: SectionItemData[];
	onChange: (values: SectionItemData[]) => void;
	canAddMore?: boolean;
	minItems?: number;
	maxItems?: number;
	onRemoveSection?: () => void;
}

export const Section =  React.memo(function Section({
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
	const [isExpanded, setIsExpanded] = useState(false);
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
		value: string | string[] | Record<string, string> | unknown,
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
			sectionId: values[0]?.sectionId || "",
			displayOrder: values.length,
			fieldValues: fields.map((field) => ({
				id: crypto.randomUUID(),
				sectionItemId: "", // Will be set when saved
				fieldId: field.id || "", // Ensure fieldId is a string
				value: "",
			})),
		};

		onChange([...values, newItem]);
	};

	const handleRemoveItem = (index: number) => {
		if (values.length <= minItems) return;
		onChange(values.filter((_, i) => i !== index));
	};

	const handleFieldChange = (index: number, fieldId: string, value: string) => {
		const newValues = values.map((item, i) => {
			if (i !== index) return item;

			return {
				...item,
				fieldValues: (item.fieldValues || []).map((fv) =>
					fv.fieldId === fieldId ? { ...fv, value } : fv,
				),
			};
		});

		onChange(newValues);
	};

	const renderField = (
		item: SectionItemData,
		index: number,
		field: SectionFieldData,
	) => {
		const fieldValue =
			item.fieldValues?.find((fv) => fv.fieldId === field.id)?.value || "";
		const isInvalid = isFieldInvalid(item.id, field, fieldValue);

		return (
			<div
				key={`${item.id}-${field.id}`}
				className={cn(
					"col-span-1 sm:col-span-2 md:col-span-1",
					field.fullWidth && "md:col-span-2",
				)}
			>
				<Label>
					{field.label}
					{field.required && <span className="text-red-500">*</span>}
				</Label>
				<div className="relative">
					{field.type === "textarea" ? (
						<Textarea
							value={fieldValue}
							onChange={(e) =>
								handleFieldChange(index, field.id || "", e.target.value)
							}
							onBlur={() => markFieldAsTouched(item.id, field.id || "")}
							placeholder={field.placeholder}
							className={isInvalid ? "border-red-500" : ""}
						/>
					) : field.type === "date" ? (
						<MonthYearSelect
							value={fieldValue}
							onChange={(value) =>
								handleFieldChange(index, field.id || "", value)
							}
							className="w-full"
						/>
					) : (
						<Input
							type={field.type === "link" ? "url" : "text"}
							value={fieldValue}
							onChange={(e) =>
								handleFieldChange(index, field.id || "", e.target.value)
							}
							onBlur={() => markFieldAsTouched(item.id, field.id || "")}
							placeholder={field.placeholder}
							className={isInvalid ? "border-red-500" : ""}
						/>
					)}
					{isInvalid && (
						<div className="absolute inset-y-0 right-0 pr-3 flex items-center">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger>
										<AlertCircle className="h-4 w-4 text-red-500" />
									</TooltipTrigger>
									<TooltipContent>This field is required</TooltipContent>
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
						type="button"
						className="text-primary hover:text-primary hover:border-primary hover:border hover:bg-transparent hover:shadow-sm transition-all"
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
							type="button"
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
											type="button"
											onClick={() => handleRemoveItem(index)}
											className="absolute top-2 right-2 text-destructive"
											aria-label="Remove Item"
										>
											<Trash className="h-4 w-4" />
										</Button>
									)}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
									type="button"
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
});
