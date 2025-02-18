import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, integer, serial, timestamp } from "drizzle-orm/pg-core";
import { Pool } from "pg";


if (!Bun.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set in environment variables");
    process.exit(1);
}

// PostgreSQL Connection with better configuration
const pool = new Pool({
    connectionString: Bun.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Add error handling for the pool
pool.on('error', (err: any) => {
    console.error('❌ Unexpected error on idle database client', err);
    process.exit(-1);
});

export const db = drizzle(pool);

// Enhanced schema with timestamps and indices
export const locations = pgTable("locations", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").notNull(),
    city: text("city").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
});
