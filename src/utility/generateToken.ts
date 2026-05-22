import jwt from "jsonwebtoken";
import { config } from "../config";

export const generateToken = (data: object) => {
    return jwt.sign(data, config.jwtSecret, { expiresIn: "1h" });

}