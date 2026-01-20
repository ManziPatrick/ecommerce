"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentController = void 0;
const asyncHandler_1 = __importDefault(require("@/shared/utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("@/shared/utils/sendResponse"));
const logs_factory_1 = require("../logs/logs.factory");
class ShipmentController {
    constructor(shipmentService) {
        this.shipmentService = shipmentService;
        this.logsService = (0, logs_factory_1.makeLogsService)();
        this.createShipment = (0, asyncHandler_1.default)(async (req, res) => {
            const data = req.body;
            const shipment = await this.shipmentService.createShipment(data);
            (0, sendResponse_1.default)(res, 201, {
                data: shipment,
                message: "Shipment created successfully",
            });
            const start = Date.now();
            const end = Date.now();
            this.logsService.info("Shipment created", {
                userId: req.user?.id,
                sessionId: req.session.id,
                timePeriod: end - start,
            });
        });
    }
}
exports.ShipmentController = ShipmentController;
