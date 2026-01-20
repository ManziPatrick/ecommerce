"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentRepository = void 0;
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class ShipmentRepository {
    async createShipment(data) {
        const shipment = await database_config_1.default.shipment.create({
            data,
        });
        return shipment;
    }
}
exports.ShipmentRepository = ShipmentRepository;
