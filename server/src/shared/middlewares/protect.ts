import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../errors/AppError";
import prisma from "@/infra/database/database.config";
import { User } from "../types/userTypes";

const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const accessToken = req?.cookies?.accessToken;
    console.log("accessToken: ", accessToken);
    if (!accessToken) {
      return next(new AppError(401, "Unauthorized, please log in"));
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!
    ) as User;

    console.log("Decoded: ", decoded);

    const user = await prisma.user.findUnique({
      where: { id: String(decoded.id) },
      select: { id: true, role: true },
    });

    if (!user) {
      return next(new AppError(401, "User no longer exists."));
    }

    req.user = { id: decoded.id, role: user.role };
    next();
  } catch (error: any) {
    // Handle JWT expiration gracefully without scary stack traces
    if (error.name === 'TokenExpiredError') {
      return next(new AppError(401, "Session expired, please log in again"));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError(401, "Invalid token, please log in"));
    }
    // Only log unexpected errors
    console.error("Unexpected auth error:", error.message);
    return next(new AppError(401, "Authentication failed, please log in"));
  }
};

export default protect;
