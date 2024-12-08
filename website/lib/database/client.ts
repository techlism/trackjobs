import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from "./schema";
import * as relation from "./relations";

const client = createClient({
  // biome-ignore lint/style/noNonNullAssertion: <It will be supplied in all cases>
  url: process.env.DATABASE_URL!,
  // biome-ignore lint/style/noNonNullAssertion: <It will be supplied in all cases>
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});

const db = drizzle(client, { schema : {...schema, ...relation} });

export default db;