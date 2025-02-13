import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import Database from "better-sqlite3";
export const db = drizzle(
    new Pool({
        connectionString: process.env.DATABASE_URL,
    })
);
