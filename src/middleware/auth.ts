import type { NextFunction, Request, Response } from "express";
import type { Role } from "../modules/auth/auth.interface";
import sendResponse from "../utility/sendResponse";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { config } from "../config";
import { pool } from "../db";


const auth = (...roles: Role[]) => {

    return async (req: Request, res: Response, next: NextFunction) => {

        try {
            const token = req.headers.authorization as string;
            if (!token) {
                sendResponse(res, 401, {
                    success: false,
                    message: "No token provided",
                    error: "Unauthorized"
                });
                return;
            }

            const decoded = jwt.verify(token, config.jwtSecret as string) as JwtPayload;
            const currentUser = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
            if (!currentUser.rows[0]) {
                sendResponse(res, 401, {
                    success: false,
                    message: "User not found",
                    error: "Unauthorized"
                });
                return;
            }

            if (roles.length && !roles.includes(currentUser.rows[0].role)) {
                sendResponse(res, 403, {
                    success: false,
                    message: "You do not have permission to access this resource",
                    error: "Forbidden"
                });
                return;
            }
            req.user = decoded;
            next();
        } catch (error) {
            sendResponse(res, 500, {
                success: false,
                message: "Internal server error",
                error: error
            });
        }
    }
}

export default auth;