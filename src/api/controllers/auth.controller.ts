import type { Request, Response } from "express";
import authService from "../services/auth.service";
import { sendResponse } from "../../utils/sendResponse";
import { signToken, verifyToken } from "../../utils/jwt";

// Validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const signUp = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      sendResponse(
        res,
        { message: "Name, email, and password are required", errors: "Missing required fields" },
        400
      );
      return;
    }

    if (typeof name !== "string" || name.trim().length === 0) {
      sendResponse(
        res,
        { message: "Name must be a non-empty string", errors: "Invalid name" },
        400
      );
      return;
    }

    if (!isValidEmail(email)) {
      sendResponse(
        res,
        { message: "Email must be a valid email address", errors: "Invalid email format" },
        400
      );
      return;
    }

    if (typeof password !== "string" || password.length < 6) {
      sendResponse(
        res,
        { message: "Password must be at least 6 characters", errors: "Invalid password" },
        400
      );
      return;
    }

    if (role && !["contributor", "maintainer"].includes(role)) {
      sendResponse(
        res,
        { message: "Role must be either 'contributor' or 'maintainer'", errors: "Invalid role" },
        400
      );
      return;
    }

    const user = await authService.createUser({
      name,
      email,
      password,
      role: role || "contributor"
    });

    if (!user) {
      sendResponse(
        res,
        { message: "User creation failed", errors: "Database error" },
        400
      );
      return;
    }

    sendResponse(
      res,
      { message: "User registered successfully", data: user },
      201
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    sendResponse(res, { message, errors: message }, 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendResponse(
        res,
        { message: "Email and password are required", errors: "Missing credentials" },
        400
      );
      return;
    }

    const user = await authService.validateUser(email, password);

    if (!user) {
      sendResponse(
        res,
        { message: "Invalid email or password", errors: "Authentication failed" },
        401
      );
      return;
    }

    const { accessToken, refreshToken } = signToken(user);

    res.cookie("refreshToken", refreshToken, {
      sameSite: "lax",
      httpOnly: true,
      secure: false
    });

    const result = { token: accessToken, user };
    sendResponse(
      res,
      { message: "Login successful", data: result },
      200
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    sendResponse(res, { message, errors: message }, 500);
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      sendResponse(
        res,
        { message: "Refresh token not found", errors: "Missing token" },
        401
      );
      return;
    }

    const payload = verifyToken(refreshToken, "refresh");

    if (!payload) {
      sendResponse(
        res,
        { message: "Invalid refresh token", errors: "Token verification failed" },
        401
      );
      return;
    }

    const user = await authService.getUserById(payload.id);

    if (!user) {
      sendResponse(
        res,
        { message: "User not found", errors: "User not found" },
        401
      );
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = signToken(user);

    res.cookie("refreshToken", newRefreshToken, {
      sameSite: "lax",
      httpOnly: true,
      secure: false
    });

    sendResponse(
      res,
      {
        message: "Token refreshed successfully",
        data: { token: accessToken, refreshToken: newRefreshToken }
      },
      200
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    sendResponse(res, { message, errors: message }, 500);
  }
};
