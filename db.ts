import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, integer, serial } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import { config } from "dotenv";

config();

// PostgreSQL Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Force SSL for Render PostgreSQL
});

export const db = drizzle(pool);

// Define and Export Schema
export const locations = pgTable("locations", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").notNull(),
    city: text("city").notNull(),
});

