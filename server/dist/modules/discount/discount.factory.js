"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeDiscountController = void 0;
const discount_repository_1 = require("./discount.repository");
const discount_service_1 = require("./discount.service");
const discount_controller_1 = require("./discount.controller");
const makeDiscountController = () => {
    const repository = new discount_repository_1.DiscountRepository();
    const service = new discount_service_1.DiscountService(repository);
    return new discount_controller_1.DiscountController(service);
};
exports.makeDiscountController = makeDiscountController;
