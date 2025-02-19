import { z } from "zod"
export const SignUpSchema = z
	.object({
		email: z.string().email({ message: "Invalid email address" }),
		password: z
			.string()
			.min(8, { message: "Password must be at least 8 characters long" }),
		confirmPassword: z
			.string()
			.min(8, { message: "Password must be at least 8 characters long" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	})

export const SignInSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters long" }),
})

export const OtpSchema = z.object({
	otp: z.string().length(6, { message: "OTP must be 6 characters long" }),
});

export const ResetPasswordSchema = z.object({
	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters long" }),
	confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters long" }),
}).refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"], });

export type JobStatus = "Saved" | "Applied" | "OA/Assignment" | "Interview" | "Offer" | "Rejected" | "Withdrawn" | "Other";

export const JobSchema = z.object({
	id: z.string().optional(),
	userId: z.string(),
	role: z.string(),
	companyName: z.string(),
	jobDescriptionSummary: z.string(),
	appliedOn: z.number(),
	currentStatus: z.enum(["Saved", "Applied", "OA/Assignment", "Interview", "Offer", "Rejected", "Withdrawn", "Other"]),
	link: z.string(),
	notes: z.string().optional(),
});

export type Job = z.infer<typeof JobSchema>;

export const JobStatusValues = ["Saved", "Applied", "OA/Assignment", "Interview", "Offer", "Rejected", "Withdrawn", "Other"] as const;

export type SectionFieldType = "text" | "date" | "textarea" | "link";

export interface SectionField {
	name: string;
	label: string;
	type: SectionFieldType;
	required?: boolean;
	fullWidth?: boolean;
	placeholder?: string;
	listType?: SectionFieldType;
	id?: string;
}

export interface SectionConfig {
	title: string;
	description?: string;
	fields: SectionField[];
	allowMultiple?: boolean;
	minItems?: number;
	maxItems?: number;
}
export const SectionFieldSchema = z.object({
	id: z.string().optional(),
	name: z.string(),
	label: z.string(),
	type: z.enum(["text", "date", "textarea", "link"]),
	required: z.boolean().optional(),
	fullWidth: z.boolean().default(true),
	placeholder: z.string().optional(),
	listType: z.enum(["text", "date", "textarea", "link"]).optional(),
	displayOrder: z.number()
});

// Align with SectionConfig interface and DB schema
export const SectionConfigSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	fields: z.array(SectionFieldSchema),
	allowMultiple: z.boolean().optional(),
	minItems: z.number().optional(),
	maxItems: z.number().optional()
});

// Align with DB schema personal fields
export const PersonalSchema = z.object({
	fullName: z.string().min(1, "Full name is required"),
	email: z.string().email("Invalid email"),
	phone: z.string().optional().transform(val => val === "" ? undefined : val),
	location: z.string().optional().transform(val => val === "" ? undefined : val),
	summary: z.string().optional().transform(val => val === "" ? undefined : val),
	github: z.string().url("Invalid URL").optional()
		.transform(val => val === "" ? undefined : val),
	linkedin: z.string().url("Invalid URL").optional()
		.transform(val => val === "" ? undefined : val),
	portfolio: z.string().url("Invalid URL").optional()
		.transform(val => val === "" ? undefined : val),
});

// Align with DB schema section field values
export const SectionFieldValueSchema = z.object({
	id: z.string(),
	sectionItemId: z.string(),
	fieldId: z.string(),
	value: z.string(),
});

// Align with DB schema section items
export const SectionItemSchema = z.object({
	id: z.string(),
	sectionId: z.string(),
	displayOrder: z.number(),
	fieldValues: z.array(SectionFieldValueSchema).optional()
});

// Align with DB schema sections
export const SectionSchema = z.object({
	id: z.string(),
	resumeId: z.string(),
	title: z.string(),
	description: z.string().optional(),
	displayOrder: z.number(),
	allowMultiple: z.boolean().optional(),
	minItems: z.number().optional(),
	maxItems: z.number().optional(),
	fields: z.array(SectionFieldSchema).optional(),
	items: z.array(SectionItemSchema).optional()
});

// Main Resume Schema aligned with DB schema
export const ResumeSchema = z.object({
	// The UserId and ResumeId is not required inside the ResumeSchema as it will be handled and added by the server when saving to the database
	// id: z.string().optional(),
	// userId: z.string().optional(),
	resumeTitle: z.string().default(`Resume - ${new Date().toLocaleDateString()}`),
	fullName: z.string().min(1, "Full name is required"),
	email: z.string().email("Invalid email"),
	phone: z.string().optional(),
	location: z.string().optional(),
	summary: z.string().optional(),
	github: z.string().url("Invalid URL").optional(),
	linkedin: z.string().url("Invalid URL").optional(),
	portfolio: z.string().url("Invalid URL").optional(),
	sections: z.array(SectionSchema).optional()
});

// Keep existing type exports
export type ResumeData = z.infer<typeof ResumeSchema>;
export type PersonalData = z.infer<typeof PersonalSchema>;
export type SectionData = z.infer<typeof SectionSchema>;
export type SectionItemData = z.infer<typeof SectionItemSchema>;
export type SectionFieldData = z.infer<typeof SectionFieldSchema>;
export type SectionFieldValueData = z.infer<typeof SectionFieldValueSchema>;


export type ApiResponse<T> = {
	data?: T;
	error?: string;
};



export interface FundingRound {
	amount_raised_usd: number | null
	funding_stage: string
	valuation_usd: number | null
	investors: string | null
	snapshot_date: string
}

export interface Company {
	company_id: string
	company_name: string
	industry_sector: string
	website: string | null
	linkedin: string | null
	brief_summary: string | null
	funding_rounds: FundingRound[]
}

export interface DashboardData {
	data: Company[]
	currentPage: number
	totalPages: number
	batchDate: string
	industries: string[] // Added industries to DashboardData
}

export interface FundingFilters {
	search?: string;
	industry?: string;
	series?: string[];
	minValuation?: number;
	sortBy?: "company_name" | "latest_raise" | "valuation" | "funding_stage";
	sortDirection?: "asc" | "desc";
	limit?: number;
	offset?: number;
}