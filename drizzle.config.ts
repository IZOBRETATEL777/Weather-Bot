import { config } from "dotenv";
config();

export default {
  schema: "./db/schema.ts",   // Path to schema definition
  out: "./db/migrations",     // Path where migrations will be stored
  dialect: "postgresql",      // Use PostgreSQL as the database dialect
  dbCredentials: {
    url: process.env.DATABASE_URL + "?sslmode=require",  // Force SSL
  },
};

