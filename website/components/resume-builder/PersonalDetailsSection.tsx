import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeData } from "@/lib/types";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";

interface PersonalDetailsProps {
	values: ResumeData["personal"];
	onChange: (values: ResumeData["personal"]) => void;
}

export function PersonalDetails({ values, onChange }: PersonalDetailsProps) {
	const fields: Array<{
		name: keyof ResumeData["personal"];
		label: string;
		type: "text" | "textarea";
		required?: boolean;
	}> = [
		{ name: "fullName", label: "Full Name", type: "text", required: true },
		{ name: "email", label: "Email", type: "text", required: true },
		{ name: "phone", label: "Phone", type: "text" },
		{ name: "location", label: "Location", type: "text" },
		{ name: "github", label: "GitHub URL", type: "text" },
		{ name: "linkedin", label: "LinkedIn URL", type: "text" },
		{ name: "portfolio", label: "Portfolio URL", type: "text" },
		{ name: "summary", label: "Professional Summary", type: "textarea" },
	];

	const handleFieldChange = (
		field: keyof ResumeData["personal"],
		value: string,
	) => {
		onChange({
			...values,
			[field]: value,
		});
	};

	const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
		{},
	);

	return (
		<Card className="w-full mb-4">
			<CardHeader>
				<CardTitle>Personal Information</CardTitle>
				<CardDescription>
					Tell us about yourself. This information will be displayed on your Resume as is.
				</CardDescription>
			</CardHeader>
			<CardContent className="grid grid-cols-2 gap-4">
				{fields.map(({ name, label, type, required }, index) => (
					<div key={name} className={`${(index === fields.length - 1 || index === fields.length - 2) ? 'col-span-2' : 'col-span-1'}`}>
						<Label>
							{label}
							{required && <span className="text-red-500">*</span>}
						</Label>
						<div className="relative">
							{type === "textarea" ? (
								<Textarea
									placeholder={label}
									value={values[name] || ""}
									onChange={(e) => handleFieldChange(name, e.target.value)}
									onBlur={() =>
										setTouchedFields((prev) => ({ ...prev, [name]: true }))
									}
									className={
										required && touchedFields[name] && !values[name]
											? "border-red-500 focus:ring-red-500"
											: ""
									}
								/>
							) : (
								<div className="relative">
									<Input
										type="text"
										placeholder={label}
										value={values[name] || ""}
										onChange={(e) => handleFieldChange(name, e.target.value)}
										onBlur={() =>
											setTouchedFields((prev) => ({ ...prev, [name]: true }))
										}
										className={
											required && touchedFields[name] && !values[name]
												? "border-red-500 focus:ring-red-500"
												: ""
										}
									/>
									{required && touchedFields[name] && !values[name] && (
										<div className="absolute inset-y-0 right-0 pr-3 flex items-center">
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<AlertCircle className="h-4 w-4 text-red-500" />
													</TooltipTrigger>
													<TooltipContent>
														<p>{label} is required</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
