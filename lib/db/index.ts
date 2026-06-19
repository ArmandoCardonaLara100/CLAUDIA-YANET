import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Reuse a single postgres client across hot-reloads / serverless invocations.
const globalForDb = globalThis as unknown as {
  __psiconnectSql?: ReturnType<typeof postgres>;
};

type DB = PostgresJsDatabase<typeof schema>;

let instance: DB | undefined;

function getDb(): DB {
  if (instance) return instance;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // `prepare: false` is required for Supabase's transaction-mode connection pooler.
  const client =
    globalForDb.__psiconnectSql ??
    postgres(connectionString, { prepare: false });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__psiconnectSql = client;
  }

  instance = drizzle(client, { schema });
  return instance;
}

// Lazy proxy: the connection is only created on first query, so the app
// (and `next build`) still boots in environments where DATABASE_URL is unset.
export const db = new Proxy({} as DB, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop, getDb());
  },
});

export { schema };
