import exp from "constants";
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
