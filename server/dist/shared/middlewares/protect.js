"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
const protect = async (req, res, next) => {
    try {
        const accessToken = req?.cookies?.accessToken;
        console.log("accessToken: ", accessToken);
        if (!accessToken) {
            return next(new AppError_1.default(401, "Unauthorized, please log in"));
        }
        const decoded = jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        console.log("Decoded: ", decoded);
        const user = await database_config_1.default.user.findUnique({
            where: { id: String(decoded.id) },
            select: { id: true, role: true },
        });
        if (!user) {
            return next(new AppError_1.default(401, "User no longer exists."));
        }
        req.user = { id: decoded.id, role: user.role };
        next();
    }
    catch (error) {
        // Handle JWT expiration gracefully without scary stack traces
        if (error.name === 'TokenExpiredError') {
            return next(new AppError_1.default(401, "Session expired, please log in again"));
        }
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError_1.default(401, "Invalid token, please log in"));
        }
        // Only log unexpected errors
        console.error("Unexpected auth error:", error.message);
        return next(new AppError_1.default(401, "Authentication failed, please log in"));
    }
};
exports.default = protect;
