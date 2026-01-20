"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAuthController = void 0;
const auth_repository_1 = require("./auth.repository");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const cart_factory_1 = require("../cart/cart.factory");
const makeAuthController = () => {
    const repository = new auth_repository_1.AuthRepository();
    const authService = new auth_service_1.AuthService(repository);
    const cartService = (0, cart_factory_1.makeCartService)();
    return new auth_controller_1.AuthController(authService, cartService);
};
exports.makeAuthController = makeAuthController;
