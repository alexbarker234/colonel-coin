import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

dotenv.config();

export const db = drizzle(
    new Pool({
        connectionString: process.env.DATABASE_URL
    })
);
