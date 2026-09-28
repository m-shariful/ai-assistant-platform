import type { NextFunction, Request, Response } from "express";

export function logger(req: Request, _res: Response, next: NextFunction): void {
  console.log(`${req.method} ${req.originalUrl}`);

  next();
}
