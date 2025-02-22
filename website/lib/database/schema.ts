import { sqliteTable, text, integer, primaryKey, real, foreignKey } from "drizzle-orm/sqlite-core";
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { ResumeData } from "../types";
import { generateRandomId } from "@/utils";


export const userTable = sqliteTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique().notNull(),
  hashedPassword: text("hashed_password"),
  isEmailVerified: integer("is_email_verified", { mode: "boolean" }).notNull().$defaultFn(() => false),
  // Fields for potential future OAuth integration
  provider: text("provider"),
  providerId: text("provider_id"),
});

export const emailVerificationTable = sqliteTable("email_verification", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  code: text("code").notNull(),
  sentAt: integer("sent_at", { mode: "timestamp" }).notNull(),
});

export const sessionTable = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer("expires_at").notNull()
});

export const oauthAccountTable = sqliteTable("oauth_account", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  provider: text("provider").notNull(), // google, github
  providerUserId: text("provider_user_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: integer("expires_at").notNull()
});

export const jobTable = sqliteTable("job_details", {
  id: text("id").primaryKey().$defaultFn(generateRandomId),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  role: text("role").notNull(),
  companyName: text("company_name").notNull(),
  jobDescriptionSummary: text("job_description_summary").notNull(),
  appliedOn: integer("applied_on").notNull().$defaultFn(() => Date.now()),
  currentStatus: text("current_status", { enum: ["Saved", "Applied", "OA/Assignment", "Interview", "Offer", "Rejected", "Withdrawn", "Other"] }).notNull(),
  link: text("link").notNull(),
  notes: text("notes"),
});

export const manualResumeTable = sqliteTable('manual_resume', {
  id: text('id').primaryKey().$defaultFn(generateRandomId),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  resumeTitle: text('resume_title').notNull(),
  resumeContent: text('resume_content', { mode: 'json' }).$type<ResumeData>().notNull(),
  createdAt: integer('created_at').notNull().$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at').notNull().$defaultFn(() => Date.now()),
})


export const generatedResumeTable = sqliteTable('generated_resume', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  resumeId: text('resume_id').notNull().references(() => manualResumeTable.id),
  userId: text('user_id').notNull().references(() => userTable.id),
  resumeTitle: text('resume_title').notNull(),
  resumeContent: text('resume_content', { mode: 'json' }).$type<ResumeData>().notNull(),
  jobId: text('job_id').notNull().references(() => jobTable.id),
  createdAt: integer('created_at').notNull().$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at').notNull().$defaultFn(() => Date.now()),
});


export const generatedResumeCountTable = sqliteTable('generated_resume_count', {
  user_id: text('user_id')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  job_id: text('job_id')
    .notNull()
    .references(() => jobTable.id, { onDelete: 'cascade' }),
  count: integer('count', { mode: 'number' }).notNull().$defaultFn(() => 0),
}, (table) => ({
  pk: primaryKey({ columns: [table.user_id, table.job_id] })
}));


export const companies = sqliteTable('companies', {
  company_id: text('company_id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  company_name: text('company_name').notNull().unique(), 
  industry_sector: text('industry_sector').notNull(), 
  website: text('website'), 
  linkedin: text('linkedin'), 
  brief_summary: text('brief_summary'), 
  created_at: text('created_at').$defaultFn(() => new Date().toISOString()),
});


export const funding_rounds = sqliteTable(
  'funding_rounds',
  {
    round_id: text('round_id').primaryKey().$defaultFn(() => crypto.randomUUID()), 
    company_id: text('company_id').notNull(), 
    amount_raised_usd: real('amount_raised_usd'),
    funding_stage: text('funding_stage').notNull(), 
    valuation_usd: real('valuation_usd'), 
    investors: text('investors'), 
    sources: text('sources'), 
    snapshot_date: text('snapshot_date').notNull(),
    created_at: text('created_at').$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    company_fk: foreignKey({
      columns: [table.company_id],
      foreignColumns: [companies.company_id],
    }),
    unique_company_snapshot: primaryKey({
      columns: [table.company_id, table.snapshot_date],
    }),
  })
);

// Infer Types for Generated Resume
export type GeneratedResume = InferSelectModel<typeof generatedResumeTable>;
export type GeneratedResumeCount = InferSelectModel<typeof generatedResumeCountTable>;
export type NewGeneratedResume = InferInsertModel<typeof generatedResumeTable>;
export type NewGeneratedResumeCount = InferInsertModel<typeof generatedResumeCountTable>;

// Infer Types for Manual Resumes
export type NewManualResume = InferInsertModel<typeof manualResumeTable>;
export type ManualResume = InferSelectModel<typeof manualResumeTable>;

// Infer Select Type for FundingRounds and Companies (Not required as of now)

