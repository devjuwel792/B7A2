import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { getUserByEmail, signupUser } from "./auth.service";
import type { ICreateUserRequest, ILoginRequest } from "./auth.interface";
import bcrypt from "bcrypt";
import { generateToken } from "../../utility/generateToken";

export const signup = async (req: Request, res: Response) => {
  const { email, name, password, role } = req.body as ICreateUserRequest;
  try {
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      sendResponse(res, 400, {
        success: false,
        message: "User with this email already exists",
        error: "User with this email already exists",
      });
    }

    const user = await signupUser({
      email,
      name,
      password,
      role,
    });
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

export const login = async (req: Request, res: Response) => {


  const { email, password } = req.body as ILoginRequest;

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      sendResponse(res, 400, {
        success: false,
        message: "Invalid email",
        error: "Invalid email",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      sendResponse(res, 400, {
        success: false,
        message: "Invalid password",
        error: "Invalid password",
      });
      return;
    }

    const generatedToken = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    sendResponse(res, 200, {
      success: true,
      message: "Login successful",
      data: {
        token: generatedToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
        }
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

