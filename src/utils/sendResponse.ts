import type { Response } from "express";

export function sendResponse<T>(
  res: Response,
  { message, data, errors }: { message: unknown; data?: T; errors?: unknown },
  status = 200,
) {
  res.status(status).json({
    success: status >= 200 && status < 300,
    message: message,
    ...(data !== undefined && { data }),
    ...(errors !== undefined && { errors }),
  });
}
