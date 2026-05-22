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


export const initDB = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'contributor' CHECK (role IN ('contributor','maintainer')),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS issues(
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL CHECK (char_length(title) <= 150),
        description TEXT NOT NULL CHECK (char_length(description) >= 20),
        type VARCHAR(20) NOT NULL CHECK (type IN ('bug','feature_request')),
        status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open',
        'in_progress','resolved')),
        reporter_id INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    `);
  } catch (error) {
    console.log(error);
  }
};
