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

export type MonthName =
  | "January" | "February" | "March" | "April" | "May" | "June"
  | "July" | "August" | "September" | "October" | "November" | "December";

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
  htmlConfig?: {
    tag: string;
    className?: string;
    wrapper?: {
      tag: string;
      className?: string;
    };
  };
}

export interface SectionConfig {
  title: string;
  description?: string;
  fields: SectionField[];
  allowMultiple?: boolean;
  minItems?: number;
  maxItems?: number;
  htmlConfig?: {
    containerTag: string;
    containerClass?: string;
    itemTag: string;
    itemClass?: string;
  };
}

// Schema definitions with Zod
const PersonalSchema = z.object({
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

const SectionItemSchema = z.object({
  id: z.string(),
  fields: z.record(z.union([
    z.string(),
    z.array(z.string()),
    z.object({
      type: z.enum(["text", "date", "textarea", "link"]),
      value: z.union([z.string(), z.array(z.string())])
    })
  ]))
});

const SectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  items: z.array(SectionItemSchema)
});

export const ResumeSchema = z.object({
  personal: PersonalSchema,
  sections: z.array(SectionSchema)
});

export type ResumeData = z.infer<typeof ResumeSchema>;
export type PersonalData = z.infer<typeof PersonalSchema>;
export type SectionData = z.infer<typeof SectionSchema>;
export type SectionItemData = z.infer<typeof SectionItemSchema>;

// Helper function to create empty section item
export const createEmptySectionItem = (fields: SectionField[]): SectionItemData => ({
  id: crypto.randomUUID(),
  fields: fields.reduce((acc, field) =>
    Object.assign(acc, {
      [field.name] : ""
    }), {})
});

// Helper function to validate field values
export const validateFieldValue = (
  value: string | string[] | { type: SectionFieldType; value: string | string[] },
  type: SectionFieldType
): boolean => {
  if (typeof value === "object" && "type" in value) {
    return validateFieldValue(value.value, value.type);
  }

  switch (type) {
    case "date": {
      if (typeof value !== "string") return false;
      const [month, year] = value.split(" ");
      return /^\d{4}$/.test(year) &&
        ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"].includes(month);
    }

    case "link":
      return typeof value === "string" && /^https?:\/\/.+/.test(value);

    // case "list":
    //   return Array.isArray(value);

    default:
      return typeof value === "string";
  }
};