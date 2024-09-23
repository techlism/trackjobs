import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle"
import db from "../database/client";
// import { sessionTable, userTable } from "../database/schema";

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
const userTable = sqliteTable("user", {
	id: text("id").primaryKey()
});

const sessionTable = sqliteTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id),
	expiresAt: integer("expires_at").notNull()
});

// The error is not causing any issues for now, but it there due to some type mismatch in sessionTable.
const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

export default adapter;
