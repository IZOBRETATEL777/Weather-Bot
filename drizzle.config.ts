export default {
  schema: "./db.ts",   // Path to schema definition
  out: "./db/migrations",     // Path where migrations will be stored
  dialect: "postgresql",      // Use PostgreSQL as the database dialect
  dbCredentials: {
    url: Bun.env.DATABASE_URL + "?sslmode=require",  // Force SSL
  },
};

