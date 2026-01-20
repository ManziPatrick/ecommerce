"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentService = void 0;
class ShipmentService {
    constructor(shipmentRepository) {
        this.shipmentRepository = shipmentRepository;
    }
    async createShipment(data) {
        const shipment = await this.shipmentRepository.createShipment(data);
        return shipment;
    }
}
exports.ShipmentService = ShipmentService;
