import { pgTable, text, integer, serial, timestamp } from "drizzle-orm/pg-core";

// Define the locations table schema
export const locations = pgTable("locations", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").notNull(),
    city: text("city").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
});

