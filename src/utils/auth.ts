import type { NextFunction, Request, Response } from "express";

import authService from "../api/services/auth.service";
import type { Role } from "../types";
import { verifyToken } from "../utils/jwt";
import { sendResponse } from "../utils/sendResponse";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return sendResponse(res, { message: "Access token is missing", errors: "Missing token" }, 401);
    }

    const payload = verifyToken(token, "access");

    if (!payload) {
      return sendResponse(res, { message: "Invalid access token", errors: "Token verification failed" }, 401);
    }

    const user = await authService.getUserById(payload.id);
    if (!user) {
      return sendResponse(res, { message: "User not found", errors: "User does not exist" }, 404);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRoles = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendResponse(_res, { message: "Unauthorized", errors: "User not authenticated" }, 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendResponse(
        _res,
        { message: "Forbidden - you don't have permission", errors: "Insufficient permissions" },
        403,
      );
    }

    return next();
  };
};
