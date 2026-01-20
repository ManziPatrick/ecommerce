"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
const sendEmail_1 = __importDefault(require("@/shared/utils/sendEmail"));
const passwordReset_1 = __importDefault(require("@/shared/templates/passwordReset"));
const authUtils_1 = require("@/shared/utils/authUtils");
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("@/infra/winston/logger"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const BadRequestError_1 = __importDefault(require("@/shared/errors/BadRequestError"));
const NotFoundError_1 = __importDefault(require("@/shared/errors/NotFoundError"));
class AuthService {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }
    async registerUser({ name, email, password, role, }) {
        const existingUser = await this.authRepository.findUserByEmail(email);
        if (existingUser) {
            throw new AppError_1.default(400, "This email is already registered, please log in instead.");
        }
        // Force new registrations to be USER role only for security
        const newUser = await this.authRepository.createUser({
            email,
            name,
            password,
            role: client_1.ROLE.USER, // Ignore any role passed from client for security
        });
        const accessToken = authUtils_1.tokenUtils.generateAccessToken(newUser.id);
        const refreshToken = authUtils_1.tokenUtils.generateRefreshToken(newUser.id);
        return {
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                avatar: null,
            },
            accessToken,
            refreshToken,
        };
    }
    async signin({ email, password }) {
        const user = await this.authRepository.findUserByEmailWithPassword(email);
        if (!user) {
            throw new BadRequestError_1.default("Email or password is incorrect.");
        }
        if (!user.password) {
            throw new AppError_1.default(400, "Email or password is incorrect.");
        }
        const isPasswordValid = await authUtils_1.passwordUtils.comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new AppError_1.default(400, "Email or password is incorrect.");
        }
        const accessToken = authUtils_1.tokenUtils.generateAccessToken(user.id);
        const refreshToken = authUtils_1.tokenUtils.generateRefreshToken(user.id);
        return { accessToken, refreshToken, user };
    }
    async signout() {
        return { message: "User logged out successfully" };
    }
    async forgotPassword(email) {
        const user = await this.authRepository.findUserByEmail(email);
        if (!user) {
            throw new NotFoundError_1.default("Email");
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const hashedToken = crypto_1.default
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        await this.authRepository.updateUserPasswordReset(email, {
            resetPasswordToken: hashedToken,
            resetPasswordTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });
        const resetUrl = `${process.env.CLIENT_URL}/password-reset/${resetToken}`;
        const htmlTemplate = (0, passwordReset_1.default)(resetUrl);
        await (0, sendEmail_1.default)({
            to: user.email,
            subject: "Reset your password",
            html: htmlTemplate,
            text: "Reset your password",
        });
        return { message: "Password reset email sent successfully" };
    }
    async resetPassword(token, newPassword) {
        const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
        const user = await this.authRepository.findUserByResetToken(hashedToken);
        if (!user) {
            throw new BadRequestError_1.default("Invalid or expired reset token");
        }
        await this.authRepository.updateUserPassword(user.id, newPassword);
        return { message: "Password reset successful. You can now log in." };
    }
    async refreshToken(oldRefreshToken) {
        if (await authUtils_1.tokenUtils.isTokenBlacklisted(oldRefreshToken)) {
            throw new NotFoundError_1.default("Refresh token");
        }
        const decoded = jsonwebtoken_1.default.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const absoluteExpiration = decoded.absExp;
        const now = Math.floor(Date.now() / 1000);
        if (now > absoluteExpiration) {
            throw new AppError_1.default(401, "Session expired. Please log in again.");
        }
        const user = await this.authRepository.findUserById(decoded.id);
        console.log("refreshed user: ", user);
        if (!user) {
            throw new NotFoundError_1.default("User");
        }
        const newAccessToken = authUtils_1.tokenUtils.generateAccessToken(user.id);
        const newRefreshToken = authUtils_1.tokenUtils.generateRefreshToken(user.id, absoluteExpiration);
        const oldTokenTTL = absoluteExpiration - now;
        if (oldTokenTTL > 0) {
            await authUtils_1.tokenUtils.blacklistToken(oldRefreshToken, oldTokenTTL);
        }
        else {
            logger_1.default.warn("Refresh token is already expired. No need to blacklist.");
        }
        return { user, newAccessToken, newRefreshToken };
    }
}
exports.AuthService = AuthService;
