"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../errors/AppError"));
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
const getRoleHierarchy = (role) => {
    const hierarchy = {
        USER: 1,
        ADMIN: 2,
        SUPERADMIN: 3,
    };
    return hierarchy[role] || 0;
};
const authorizeRoleHierarchy = (minRequiredRole) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return next(new AppError_1.default(401, "Unauthorized: No user found"));
            }
            const userRole = req.user.role;
            const targetUserId = req.params.id;
            if (!targetUserId) {
                return next(new AppError_1.default(400, "Target user ID is required"));
            }
            // Get target user's role
            const targetUser = await database_config_1.default.user.findUnique({
                where: { id: targetUserId },
                select: { role: true },
            });
            if (!targetUser) {
                return next(new AppError_1.default(404, "Target user not found"));
            }
            // Check if user has minimum required role
            if (getRoleHierarchy(userRole) < getRoleHierarchy(minRequiredRole)) {
                return next(new AppError_1.default(403, "You are not authorized to perform this action"));
            }
            // Prevent modifying users with equal or higher roles
            if (getRoleHierarchy(targetUser.role) >= getRoleHierarchy(userRole)) {
                return next(new AppError_1.default(403, "Cannot modify users with equal or higher privileges"));
            }
            next();
        }
        catch (error) {
            return next(new AppError_1.default(500, "Internal server error"));
        }
    };
};
exports.default = authorizeRoleHierarchy;
