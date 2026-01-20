"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
const authUtils_1 = require("@/shared/utils/authUtils");
class UserRepository {
    async findAllUsers() {
        return await database_config_1.default.user.findMany();
    }
    async findUserById(id) {
        return await database_config_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
            },
        });
    }
    async findUserByEmail(email) {
        return await database_config_1.default.user.findUnique({ where: { email } });
    }
    async updateUser(id, data) {
        return await database_config_1.default.user.update({ where: { id }, data });
    }
    async deleteUser(id) {
        return await database_config_1.default.user.delete({ where: { id } });
    }
    async countUsersByRole(role) {
        return await database_config_1.default.user.count({
            where: { role: role },
        });
    }
    async createUser(data) {
        // Hash the password before storing
        const hashedPassword = await authUtils_1.passwordUtils.hashPassword(data.password);
        return await database_config_1.default.user.create({
            data: {
                ...data,
                password: hashedPassword,
                role: data.role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
            },
        });
    }
}
exports.UserRepository = UserRepository;
