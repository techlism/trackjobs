import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";


export const userTable = sqliteTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique().notNull(),
  hashedPassword: text("hashed_password"),
  isEmailVerified: integer("is_email_verified", { mode: "boolean" }).notNull().default(false),
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
  link: text("link").notNull().unique(),
  notes: text("notes"),
});