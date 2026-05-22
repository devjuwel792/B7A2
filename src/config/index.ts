import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

export const config = {
  connection_string: process.env.DATABASE_URL as string,
  port: process.env.PORT || 8000 as number,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn : process.env.JWT_EXPIRES_IN || "1h" as string,
};
