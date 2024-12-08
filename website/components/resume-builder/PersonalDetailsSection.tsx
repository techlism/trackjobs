import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ResumeData } from "@/lib/types";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { toast } from "sonner";

// PersonalDetailsSection.tsx
interface PersonalDetailsProps {
	values: Omit<ResumeData, "id" | "userId" | "resumeTitle" | "sections">;
	onChange: (
		values: Omit<ResumeData, "id" | "userId" | "resumeTitle" | "sections">,
	) => void;
}

export function PersonalDetails({ values, onChange }: PersonalDetailsProps) {
	const fields: Array<{
		name: keyof Omit<
			ResumeData,
			"id" | "userId" | "resumeTitle" | "sections"
		>;
		label: string;
		type: "text" | "textarea";
		required?: boolean;
		validation?: (value: string) => boolean | string;
	}> = [
		{
			name: "fullName",
			label: "Full Name",
			type: "text",
			required: true,
		},
		{
			name: "email",
			label: "Email",
			type: "text",
			required: true,
			validation: (value) => {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				return emailRegex.test(value) || "Invalid email format";
			},
		},
		{
			name: "phone",
			label: "Phone",
			type: "text",
		},
		{
			name: "location",
			label: "Location",
			type: "text",
		},
		{
			name: "github",
			label: "GitHub URL",
			type: "text",
			validation: (value) => {
				if (!value) return true; // Allow empty value
				try {
					new URL(value);
					return true;
				} catch {
					return "Invalid URL format";
				}
			},
		},
		{
			name: "linkedin",
			label: "LinkedIn URL",
			type: "text",
			validation: (value) => {
				if (!value) return true; // Allow empty value
				try {
					new URL(value);
					return true;
				} catch {
					return "Invalid URL format";
				}
			},
		},
		{
			name: "portfolio",
			label: "Portfolio URL",
			type: "text",
			validation: (value) => {
				if (!value) return true; // Allow empty value
				try {
					new URL(value);
					return true;
				} catch {
					return "Invalid URL format";
				}
			},
		},
		{
			name: "summary",
			label: "Professional Summary",
			type: "textarea",
		},
	];

	const handleFieldChange = (
		field: keyof Omit<
			ResumeData,
			"id" | "userId" | "resumeTitle" | "sections"
		>,
		value: string,
	) => {
		// Find field config
		const fieldConfig = fields.find((f) => f.name === field);

		// If field has validation and value is not empty, validate
		if (fieldConfig?.validation && value.trim()) {
			const validationResult = fieldConfig.validation(value);
			if (validationResult !== true) {
				toast.error(`Invalid ${fieldConfig.label}`, {
					description: typeof validationResult === "string"
						? validationResult
						: `Invalid ${fieldConfig.label} format`,
				});
				return;
			}
		}

		onChange({
			...values,
			[field]: value,
		});
	};
	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle>Personal Details</CardTitle>
				<CardDescription>
					Let recruiters know more about you..
				</CardDescription>
			</CardHeader>
			<CardContent className="grid grid-cols-2 gap-4 mt-4">
				{fields.slice(0, 6).map((field) => (
					<div
						key={field.name}
						className="col-span-2 sm:col-span-1"
					>
						<Label htmlFor={field.name}>
							{field.label}
							{field.required && (
								<span className="text-red-500">*</span>
							)}
						</Label>
						{field.type === "textarea"
							? (
								<Textarea
									id={field.name}
									value={values[field.name] || ""}
									onChange={(e) =>
										handleFieldChange(
											field.name,
											e.target.value,
										)}
									placeholder={field.label}
								/>
							)
							: (
								<Input
									id={field.name}
									type="text"
									value={values[field.name] || ""}
									onChange={(e) =>
										handleFieldChange(
											field.name,
											e.target.value,
										)}
									placeholder={field.label}
								/>
							)}
					</div>
				))}
				{fields.slice(6).map((field) => (
					<div
						key={field.name}
						className="col-span-2"
					>
						<Label htmlFor={field.name}>
							{field.label}
							{field.required && (
								<span className="text-red-500">*</span>
							)}
						</Label>
						{field.type === "textarea"
							? (
								<Textarea
									id={field.name}
									value={values[field.name] || ""}
									onChange={(e) =>
										handleFieldChange(
											field.name,
											e.target.value,
										)}
									placeholder={field.label}
								/>
							)
							: (
								<Input
									id={field.name}
									type="text"
									value={values[field.name] || ""}
									onChange={(e) =>
										handleFieldChange(
											field.name,
											e.target.value,
										)}
									placeholder={field.label}
								/>
							)}
					</div>
				))}
			</CardContent>
		</Card>
	);
}
