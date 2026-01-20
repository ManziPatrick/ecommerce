"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const asyncHandler_1 = __importDefault(require("@/shared/utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("@/shared/utils/sendResponse"));
const logs_factory_1 = require("../logs/logs.factory");
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
class UserController {
    constructor(userService) {
        this.userService = userService;
        this.logsService = (0, logs_factory_1.makeLogsService)();
        this.getAllUsers = (0, asyncHandler_1.default)(async (req, res) => {
            const users = await this.userService.getAllUsers();
            (0, sendResponse_1.default)(res, 200, {
                data: { users },
                message: "Users fetched successfully",
            });
        });
        this.getUserById = (0, asyncHandler_1.default)(async (req, res) => {
            const { id } = req.params;
            const user = await this.userService.getUserById(id);
            (0, sendResponse_1.default)(res, 200, {
                data: { user },
                message: "User fetched successfully",
            });
        });
        this.getUserByEmail = (0, asyncHandler_1.default)(async (req, res) => {
            const { email } = req.params;
            const user = await this.userService.getUserByEmail(email);
            (0, sendResponse_1.default)(res, 200, {
                data: { user },
                message: "User fetched successfully",
            });
        });
        this.getMe = (0, asyncHandler_1.default)(async (req, res) => {
            const id = req.user?.id;
            console.log("id: ", id);
            const user = await this.userService.getMe(id);
            console.log("user: ", user);
            (0, sendResponse_1.default)(res, 200, {
                data: { user },
                message: "User fetched successfully",
            });
        });
        this.updateMe = (0, asyncHandler_1.default)(async (req, res) => {
            const { id } = req.params;
            const updatedData = req.body;
            const user = await this.userService.updateMe(id, updatedData);
            (0, sendResponse_1.default)(res, 200, {
                data: { user },
                message: "User updated successfully",
            });
            const start = Date.now();
            const end = Date.now();
            this.logsService.info("User updated", {
                userId: req.user?.id,
                sessionId: req.session.id,
                timePeriod: end - start,
            });
        });
        this.deleteUser = (0, asyncHandler_1.default)(async (req, res) => {
            const { id } = req.params;
            const currentUserId = req.user?.id;
            if (!currentUserId) {
                throw new AppError_1.default(401, "User not authenticated");
            }
            await this.userService.deleteUser(id, currentUserId);
            (0, sendResponse_1.default)(res, 204, { message: "User deleted successfully" });
            const start = Date.now();
            const end = Date.now();
            this.logsService.info("User deleted", {
                userId: req.user?.id,
                sessionId: req.session.id,
                timePeriod: end - start,
            });
        });
        this.createAdmin = (0, asyncHandler_1.default)(async (req, res) => {
            const { name, email, password } = req.body;
            const currentUserId = req.user?.id;
            if (!currentUserId) {
                throw new AppError_1.default(401, "User not authenticated");
            }
            const newAdmin = await this.userService.createAdmin({ name, email, password }, currentUserId);
            (0, sendResponse_1.default)(res, 201, {
                data: { user: newAdmin },
                message: "Admin created successfully",
            });
            const start = Date.now();
            const end = Date.now();
            this.logsService.info("Admin created", {
                userId: req.user?.id,
                sessionId: req.session.id,
                timePeriod: end - start,
            });
        });
        this.updateAvatar = (0, asyncHandler_1.default)(async (req, res) => {
            const userId = req.user?.id;
            const file = req.file;
            if (!userId) {
                throw new AppError_1.default(401, "User not authenticated");
            }
            if (!file) {
                throw new AppError_1.default(400, "Image file is required");
            }
            const user = await this.userService.updateAvatar(userId, file);
            (0, sendResponse_1.default)(res, 200, {
                data: { user },
                message: "Avatar updated successfully",
            });
        });
    }
}
exports.UserController = UserController;
