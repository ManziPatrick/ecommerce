"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorRequestRepository = void 0;
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
const client_1 = require("@prisma/client");
class VendorRequestRepository {
    async createVendorRequest(data) {
        return database_config_1.default.vendorRequest.create({
            data,
        });
    }
    async findVendorRequests(params) {
        const { where = {}, orderBy = { createdAt: "desc" }, skip = 0, take = 10 } = params;
        return database_config_1.default.vendorRequest.findMany({
            where,
            orderBy,
            skip,
            take,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async findVendorRequestById(id) {
        return database_config_1.default.vendorRequest.findUnique({
            where: { id },
            include: {
                user: true,
            },
        });
    }
    async updateVendorRequest(id, data) {
        return database_config_1.default.vendorRequest.update({
            where: { id },
            data,
        });
    }
    async findRequestByUserId(userId) {
        return database_config_1.default.vendorRequest.findFirst({
            where: { userId, status: client_1.VENDOR_REQUEST_STATUS.PENDING },
        });
    }
    async countVendorRequests(where = {}) {
        return database_config_1.default.vendorRequest.count({ where });
    }
}
exports.VendorRequestRepository = VendorRequestRepository;
