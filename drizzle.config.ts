import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit doesn't read .env.local automatically.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Use the direct (non-pooled) connection for migrations.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
});
