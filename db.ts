import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, integer, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { Pool } from "pg";


if (!Bun.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set in environment variables");
    process.exit(1);
}

// PostgreSQL Connection with better configuration
const pool = new Pool({
    connectionString: Bun.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // ✅ Required for cloud-hosted databases
    max: 10, // ✅ Limit max connections to avoid timeout issues
    idleTimeoutMillis: 30000, // ✅ Close idle connections after 30 seconds
    connectionTimeoutMillis: 5000, // ✅ Timeout after 5 seconds if unable to connect
});

// Add error handling for the pool
pool.on('error', (err: Error) => {
    console.error('❌ Unexpected error on idle database client', err);
    process.exit(-1);
});

export const db = drizzle(pool);

// Enhanced schema with timestamps and indices
export const locations = pgTable("locations", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").notNull(),
    city: text("city").notNull().unique(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const weatherData = pgTable("weather_data", {
    location_id: integer("location_id").notNull().references(() => locations.id),
    id: serial("id").primaryKey(),
    city: text("city").notNull().unique(),
    temperature: numeric("temperature").notNull(),
    recorded_at: timestamp("recorded_at").defaultNow().notNull(),
});
