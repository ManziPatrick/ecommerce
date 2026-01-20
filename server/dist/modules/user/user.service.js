"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
const uploadToCloudinary_1 = require("@/shared/utils/uploadToCloudinary");
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async getAllUsers() {
        return await this.userRepository.findAllUsers();
    }
    async getUserById(id) {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new AppError_1.default(404, "User not found");
        }
        return user;
    }
    async getUserByEmail(email) {
        const user = await this.userRepository.findUserByEmail(email);
        if (!user) {
            throw new AppError_1.default(404, "User not found");
        }
        return user;
    }
    async getMe(id) {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new AppError_1.default(404, "User not found");
        }
        return user;
    }
    async updateMe(id, data) {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new AppError_1.default(404, "User not found");
        }
        return await this.userRepository.updateUser(id, data);
    }
    async deleteUser(id, currentUserId) {
        // Prevent self-deletion
        if (id === currentUserId) {
            throw new AppError_1.default(400, "You cannot delete your own account");
        }
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new AppError_1.default(404, "User not found");
        }
        // Prevent deletion of last SUPERADMIN
        if (user.role === "SUPERADMIN") {
            const superAdminCount = await this.userRepository.countUsersByRole("SUPERADMIN");
            if (superAdminCount <= 1) {
                throw new AppError_1.default(400, "Cannot delete the last SuperAdmin");
            }
        }
        await this.userRepository.deleteUser(id);
    }
    async createAdmin(adminData, createdByUserId) {
        const creator = await this.userRepository.findUserById(createdByUserId);
        if (!creator) {
            throw new AppError_1.default(404, "Creator user not found");
        }
        if (creator.role !== "SUPERADMIN") {
            throw new AppError_1.default(403, "Only SuperAdmins can create new admins");
        }
        // Check if user already exists
        const existingUser = await this.userRepository.findUserByEmail(adminData.email);
        if (existingUser) {
            throw new AppError_1.default(400, "User with this email already exists");
        }
        // Create new admin with ADMIN role (not SUPERADMIN)
        const newAdmin = await this.userRepository.createUser({
            ...adminData,
            role: "ADMIN",
        });
        return newAdmin;
    }
    async updateAvatar(userId, file) {
        const user = await this.userRepository.findUserById(userId);
        if (!user) {
            throw new AppError_1.default(404, "User not found");
        }
        const uploads = await (0, uploadToCloudinary_1.uploadToCloudinary)([file]);
        if (uploads.length === 0) {
            throw new AppError_1.default(400, "Failed to upload image to Cloudinary");
        }
        return await this.userRepository.updateUser(userId, { avatar: uploads[0].url });
    }
}
exports.UserService = UserService;
