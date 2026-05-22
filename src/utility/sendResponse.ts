import type { Response } from "express";

type TResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
};

const sendResponse = <T>(
  res: Response,
  statusCode: number,
  data: TResponse<T>,
) => {
  res.status(statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error,
  });
};

export default sendResponse;
