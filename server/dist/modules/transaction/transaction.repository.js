"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRepository = void 0;
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class TransactionRepository {
    constructor() { }
    async findMany() {
        return database_config_1.default.transaction.findMany();
    }
    async findById(id) {
        return database_config_1.default.transaction.findUnique({
            where: { id },
            include: {
                order: {
                    include: {
                        payment: true,
                        shipment: true,
                        user: true,
                        address: true,
                        orderItems: true,
                    },
                },
            },
        });
    }
    async createTransaction(data) {
        return database_config_1.default.transaction.create({
            data,
        });
    }
    async updateTransaction(id, data) {
        return database_config_1.default.transaction.update({
            where: { id },
            data,
        });
    }
    async deleteTransaction(id) {
        return database_config_1.default.transaction.delete({
            where: { id },
        });
    }
}
exports.TransactionRepository = TransactionRepository;
