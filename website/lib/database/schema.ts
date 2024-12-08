import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';


export const userTable = sqliteTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique().notNull(),
  hashedPassword: text("hashed_password"),
  isEmailVerified: integer("is_email_verified", { mode: "boolean" }).notNull().$defaultFn(()=>false),
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
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  role: text("role").notNull(),
  companyName: text("company_name").notNull(),
  jobDescriptionSummary: text("job_description_summary").notNull(),
  appliedOn: integer("applied_on").notNull().$defaultFn(()=>Date.now()),
  currentStatus: text("current_status", { enum: ["Saved", "Applied", "OA/Assignment", "Interview", "Offer", "Rejected", "Withdrawn", "Other"] }).notNull(),
  link: text("link").notNull(),
  notes: text("notes"),
});

// RESUME BUILDER SCHEMA
export const resumeTable = sqliteTable('resume', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => userTable.id),
  resumeTitle: text('resume_title').notNull(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  location: text('location'),
  summary: text('summary'),
  github: text('github'),
  linkedin: text('linkedin'),
  portfolio: text('portfolio'),
  createdAt: integer('created_at').notNull().$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at').notNull().$defaultFn(() => Date.now()),
});

// Resume Section Table
export const resumeSectionTable = sqliteTable('resume_section', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  resumeId: text('resume_id').notNull().references(() => resumeTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  displayOrder: integer('display_order').notNull(),
  allowMultiple: integer('allow_multiple', { mode: 'boolean' }),
  minItems: integer('min_items'),
  maxItems: integer('max_items'),
  createdAt: integer('created_at').notNull().$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at').notNull().$defaultFn(() => Date.now()),
});

// Resume Section Field Table
export const resumeSectionFieldTable = sqliteTable('resume_section_field', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sectionId: text('section_id').notNull().references(() => resumeSectionTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  label: text('label').notNull(),
  type: text('type', { enum: ['text', 'date', 'textarea', 'link'] }).notNull(),
  required: integer('required', { mode: 'boolean' }),
  fullWidth: integer('full_width', { mode: 'boolean' }).$defaultFn(() => true),
  placeholder: text('placeholder'),
  listType: text('list_type', { enum: ['text', 'date', 'textarea', 'link'] }),
  displayOrder: integer('display_order').notNull(),
  createdAt: integer('created_at').notNull().$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at').notNull().$defaultFn(() => Date.now()),
});

// Resume Section Item Table
export const resumeSectionItemTable = sqliteTable('resume_section_item', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sectionId: text('section_id').notNull().references(() => resumeSectionTable.id, { onDelete: 'cascade' }),
  displayOrder: integer('display_order').notNull(),
  createdAt: integer('created_at').notNull().$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at').notNull().$defaultFn(() => Date.now()),
});

// Resume Section Field Value Table
export const resumeSectionFieldValueTable = sqliteTable('resume_section_field_value', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sectionItemId: text('section_item_id').notNull().references(() => resumeSectionItemTable.id, { onDelete: 'cascade' }),
  fieldId: text('field_id').notNull().references(() => resumeSectionFieldTable.id, { onDelete: 'cascade' }),
  value: text('value').notNull(),
  createdAt: integer('created_at').notNull().$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at').notNull().$defaultFn(() => Date.now()),
});


export const generatedResumeTable = sqliteTable('generated_resume', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  resumeId: text('resume_id').notNull().references(() => resumeTable.id),
  userId: text('user_id').notNull().references(() => userTable.id),
  resumeTitle: text('resume_title').notNull(),
  resumeContent: text('resume_content',{mode : 'json'}).notNull(),
  jobId : text('job_id').notNull().references(()=>jobTable.id),
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
  count: integer('count', {mode : 'number'}).notNull().$defaultFn(() => 0),
}, (table) => ({
  pk: primaryKey({ columns: [table.user_id, table.job_id] })
}));

// Infer types for selecting data
export type GeneratedResume = InferSelectModel<typeof generatedResumeTable>;
export type GeneratedResumeCount = InferSelectModel<typeof generatedResumeCountTable>;
export type Resume = InferSelectModel<typeof resumeTable>;
export type ResumeSection = InferSelectModel<typeof resumeSectionTable>;
export type ResumeSectionField = InferSelectModel<typeof resumeSectionFieldTable>;
export type ResumeSectionItem = InferSelectModel<typeof resumeSectionItemTable>;
export type ResumeSectionFieldValue = InferSelectModel<typeof resumeSectionFieldValueTable>;

// Infer types for inserting data
export type NewResume = InferInsertModel<typeof resumeTable>;
export type NewResumeSection = InferInsertModel<typeof resumeSectionTable>;
export type NewResumeSectionField = InferInsertModel<typeof resumeSectionFieldTable>;
export type NewResumeSectionItem = InferInsertModel<typeof resumeSectionItemTable>;
export type NewResumeSectionFieldValue = InferInsertModel<typeof resumeSectionFieldValueTable>;
export type NewGeneratedResume = InferInsertModel<typeof generatedResumeTable>;
export type NewGeneratedResumeCount = InferInsertModel<typeof generatedResumeCountTable>;