"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCartController = exports.makeCartService = void 0;
const cart_repository_1 = require("./cart.repository");
const cart_service_1 = require("./cart.service");
const cart_controller_1 = require("./cart.controller");
const makeCartService = () => {
    const repository = new cart_repository_1.CartRepository();
    return new cart_service_1.CartService(repository);
};
exports.makeCartService = makeCartService;
const makeCartController = () => {
    const service = (0, exports.makeCartService)();
    return new cart_controller_1.CartController(service);
};
exports.makeCartController = makeCartController;
