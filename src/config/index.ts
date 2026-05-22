import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

export const config = {
  connection_string: process.env.DATABASE_URL as string,
  port: process.env.PORT || 8000,
};

export const pool = new Pool({
  connectionString: config.connection_string,
});



