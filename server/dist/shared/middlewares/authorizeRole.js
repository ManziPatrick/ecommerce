"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../errors/AppError"));
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
const authorizeRole = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return next(new AppError_1.default(401, "Unauthorized: No user found"));
            }
            const user = await database_config_1.default.user.findUnique({
                where: { id: req.user.id },
                select: { role: true },
            });
            if (!user) {
                return next(new AppError_1.default(401, "Unauthorized: User not found"));
            }
            if (!allowedRoles.includes(user.role)) {
                return next(new AppError_1.default(403, "You are not authorized to perform this action"));
            }
            next();
        }
        catch (error) {
            return next(new AppError_1.default(500, "Internal server error"));
        }
    };
};
exports.default = authorizeRole;
