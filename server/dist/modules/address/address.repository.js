"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressRepository = void 0;
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class AddressRepository {
    async createAddress(data, tx) {
        return tx?.address.create({
            data: {
                orderId: data.orderId,
                userId: data.userId,
                city: data.city,
                state: data.state,
                street: data.street,
                country: data.country,
                zip: data.zip,
            },
        });
    }
    async findAddressesByUserId(userId) {
        return database_config_1.default.address.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }
    async findAddressById(addressId) {
        return database_config_1.default.address.findUnique({
            where: { id: addressId },
        });
    }
    async deleteAddress(addressId) {
        return database_config_1.default.address.delete({
            where: { id: addressId },
        });
    }
}
exports.AddressRepository = AddressRepository;
