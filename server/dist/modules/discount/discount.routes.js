"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const protect_1 = __importDefault(require("@/shared/middlewares/protect"));
const authorizeRole_1 = __importDefault(require("@/shared/middlewares/authorizeRole"));
const discount_factory_1 = require("./discount.factory");
const router = express_1.default.Router();
const discountController = (0, discount_factory_1.makeDiscountController)();
router.post("/", protect_1.default, (0, authorizeRole_1.default)("ADMIN", "SUPERADMIN"), discountController.createDiscount);
router.get("/", protect_1.default, (0, authorizeRole_1.default)("ADMIN", "SUPERADMIN"), discountController.getAllDiscounts);
router.post("/validate", protect_1.default, discountController.validateDiscount);
router.put("/:id", protect_1.default, (0, authorizeRole_1.default)("ADMIN", "SUPERADMIN"), discountController.updateDiscount);
router.delete("/:id", protect_1.default, (0, authorizeRole_1.default)("ADMIN", "SUPERADMIN"), discountController.deleteDiscount);
exports.default = router;
