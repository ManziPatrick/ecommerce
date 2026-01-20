"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("@/shared/constants");
const asyncHandler_1 = __importDefault(require("@/shared/utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("@/shared/utils/sendResponse"));
const authUtils_1 = require("@/shared/utils/authUtils");
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
const logs_factory_1 = require("../logs/logs.factory");
const { ...clearCookieOptions } = constants_1.cookieOptions;
class AuthController {
    constructor(authService, cartService) {
        this.authService = authService;
        this.cartService = cartService;
        this.logsService = (0, logs_factory_1.makeLogsService)();
        this.signup = (0, asyncHandler_1.default)(async (req, res) => {
            const start = Date.now();
            const end = Date.now();
            const { name, email, password, role } = req.body;
            const { user, accessToken, refreshToken } = await this.authService.registerUser({
                name,
                email,
                password,
                role,
            });
            res.cookie("refreshToken", refreshToken, constants_1.cookieOptions);
            res.cookie("accessToken", accessToken, constants_1.cookieOptions);
            const userId = user.id;
            const sessionId = req.session.id;
            await this.cartService?.mergeCartsOnLogin(sessionId, userId);
            (0, sendResponse_1.default)(res, 201, {
                message: "User registered successfully",
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        role: user.role,
                        avatar: user.avatar || null,
                    },
                },
            });
            this.logsService.info("Register", {
                userId,
                sessionId: req.session.id,
                timePeriod: end - start,
            });
        });
        this.signin = (0, asyncHandler_1.default)(async (req, res) => {
            const { email, password } = req.body;
            const { user, accessToken, refreshToken } = await this.authService.signin({
                email,
                password,
            });
            res.cookie("refreshToken", refreshToken, constants_1.cookieOptions);
            res.cookie("accessToken", accessToken, constants_1.cookieOptions);
            const userId = user.id;
            const sessionId = req.session.id;
            await this.cartService?.mergeCartsOnLogin(sessionId, userId);
            (0, sendResponse_1.default)(res, 200, {
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        role: user.role,
                        avatar: user.avatar,
                    },
                },
                message: "User logged in successfully",
            });
            const start = Date.now();
            const end = Date.now();
            this.logsService.info("Sign in", {
                userId,
                sessionId: req.session.id,
                timePeriod: end - start,
            });
        });
        this.signout = (0, asyncHandler_1.default)(async (req, res) => {
            const start = Date.now();
            const refreshToken = req?.cookies?.refreshToken;
            const userId = req.user?.id;
            if (refreshToken) {
                const decoded = jsonwebtoken_1.default.decode(refreshToken);
                if (decoded && decoded.absExp) {
                    const now = Math.floor(Date.now() / 1000);
                    const ttl = decoded.absExp - now;
                    if (ttl > 0) {
                        await authUtils_1.tokenUtils.blacklistToken(refreshToken, ttl);
                    }
                }
            }
            res.clearCookie("refreshToken", {
                ...clearCookieOptions,
            });
            res.clearCookie("accessToken", {
                ...clearCookieOptions,
            });
            (0, sendResponse_1.default)(res, 200, { message: "Logged out successfully" });
            const end = Date.now();
            this.logsService.info("Sign out", {
                userId,
                sessionId: req.session.id,
                timePeriod: end - start,
            });
        });
        this.forgotPassword = (0, asyncHandler_1.default)(async (req, res) => {
            const { email } = req.body;
            const response = await this.authService.forgotPassword(email);
            const userId = req.user?.id;
            (0, sendResponse_1.default)(res, 200, { message: response.message });
            const start = Date.now();
            const end = Date.now();
            this.logsService.info("Forgot Password", {
                userId,
                sessionId: req.session.id,
                timePeriod: end - start,
            });
        });
        this.resetPassword = (0, asyncHandler_1.default)(async (req, res) => {
            const { token, newPassword } = req.body;
            const response = await this.authService.resetPassword(token, newPassword);
            const userId = req.user?.id;
            (0, sendResponse_1.default)(res, 200, { message: response.message });
            const start = Date.now();
            const end = Date.now();
            this.logsService.info("Reset Password", {
                userId,
                sessionId: req.session.id,
                timePeriod: end - start,
            });
        });
        this.refreshToken = (0, asyncHandler_1.default)(async (req, res) => {
            const start = Date.now();
            const oldRefreshToken = req?.cookies?.refreshToken;
            if (!oldRefreshToken) {
                throw new AppError_1.default(401, "Refresh token not found");
            }
            const { newAccessToken, newRefreshToken, user } = await this.authService.refreshToken(oldRefreshToken);
            res.cookie("refreshToken", newRefreshToken, constants_1.cookieOptions);
            res.cookie("accessToken", newAccessToken, constants_1.cookieOptions);
            (0, sendResponse_1.default)(res, 200, {
                message: "Token refreshed successfully",
                data: { accessToken: newAccessToken, user },
            });
            const end = Date.now();
            this.logsService.info("Refresh Token", {
                userId: req.user?.id,
                sessionId: req.session.id,
                timePeriod: end - start,
            });
        });
    }
}
exports.AuthController = AuthController;
