import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { pool } from "../../db";
import sendResponse from "../../utility/sendResponse";
import type { ICreateUserRequest, IUser } from "./auth.interface";
export const createUser = async (req: Request) => {
  const { name, email, password, role } = req.body as ICreateUserRequest;
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role],
  );
  const user = result.rows[0] as IUser;
  return user;
};

export const checkEmailExists = async (email: string) => {
  const result = await pool.query(
    `SELECT  * FROM users WHERE  email = $1 `,
    [email],
  );
  return result.rows.length > 0;
}

export const loginUser = async (req: Request, res: Response) => { };


