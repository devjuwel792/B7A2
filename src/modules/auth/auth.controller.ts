import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { createUser } from "./auth.service";
import { pool } from "../../db";
import type { ICreateUserRequest } from "./auth.interface";

export const signup = async (req: Request, res: Response) => {
  const { email, name, password, role } = req.body as ICreateUserRequest;
  try {
    const existingUser = await pool.query(
      `SELECT  * FROM users WHERE  email = $1 `,
      [email],
    );

    if (existingUser.rows.length !== 0) {
      sendResponse(res, 400, {
        success: false,
        message: "User with this email already exists",
        error: "User with this email already exists",
      });
    }

    const user = await createUser(req);
    sendResponse(res, 201, {
      success: true,
      message: "User registered successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    sendResponse(res, 500, {
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};
