import type { NextFunction, Request, Response } from "express";
import sendResponse from "../utility/sendResponse";
import { StatusCodes } from "http-status-codes";

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, {
        success: false,
        message: "Internal server error",
        error: err.message || "Internal server error"
    });
}

export default globalErrorHandler;