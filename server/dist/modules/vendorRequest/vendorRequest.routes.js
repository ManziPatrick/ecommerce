"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const protect_1 = __importDefault(require("@/shared/middlewares/protect"));
const authorizeRole_1 = __importDefault(require("@/shared/middlewares/authorizeRole"));
const vendorRequest_factory_1 = require("./vendorRequest.factory");
const router = express_1.default.Router();
const vendorRequestController = (0, vendorRequest_factory_1.makeVendorRequestController)();
// User routes
router.post("/", protect_1.default, vendorRequestController.submitRequest);
// Admin routes
router.get("/", protect_1.default, (0, authorizeRole_1.default)("ADMIN", "SUPERADMIN"), vendorRequestController.getAllRequests);
router.patch("/:id", protect_1.default, (0, authorizeRole_1.default)("ADMIN", "SUPERADMIN"), vendorRequestController.updateRequestStatus);
exports.default = router;
