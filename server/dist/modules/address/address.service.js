"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressService = void 0;
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
class AddressService {
    constructor(addressRepository) {
        this.addressRepository = addressRepository;
    }
    async getUserAddresses(userId) {
        const addresses = await this.addressRepository.findAddressesByUserId(userId);
        if (!addresses || addresses.length === 0) {
            throw new AppError_1.default(404, "No addresses found for this user");
        }
        return addresses;
    }
    async getAddressDetails(addressId, userId) {
        const address = await this.addressRepository.findAddressById(addressId);
        if (!address) {
            throw new AppError_1.default(404, "Address not found");
        }
        if (address.userId !== userId) {
            throw new AppError_1.default(403, "You are not authorized to view this address");
        }
        return address;
    }
    async deleteAddress(addressId) {
        const address = await this.addressRepository.findAddressById(addressId);
        if (!address) {
            throw new AppError_1.default(404, "Address not found");
        }
        return this.addressRepository.deleteAddress(addressId);
    }
}
exports.AddressService = AddressService;
