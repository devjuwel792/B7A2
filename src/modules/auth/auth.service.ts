import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { pool } from "../../db";
import sendResponse from "../../utility/sendResponse";
import type { ICreateUserRequest, ILoginRequest, IUser } from "./auth.interface";
export const signupUser = async (body: ICreateUserRequest) => {
  const { name, email, password, role } = body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role],
  );
  const user = result.rows[0] as IUser;
  return user;
};

export const getUserByEmail = async (email: string) => {
  const result = await pool.query(
    `SELECT  * FROM users WHERE  email = $1 `,
    [email],
  );
  return result.rows[0] as IUser & { password: string } | undefined;
};


