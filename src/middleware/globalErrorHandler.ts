import type { NextFunction, Request, Response } from "express";

export const globalErrorHandler=(error: unknown, req:Request, res: Response, next: NextFunction)=>{
  res.status(500).json({
    success:false,
    message: error instanceof Error ? error.message : 'Internal Server Error',
  })
}