"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeShopController = void 0;
const shop_repository_1 = require("./shop.repository");
const shop_service_1 = require("./shop.service");
const shop_controller_1 = require("./shop.controller");
const makeShopController = () => {
    const repository = new shop_repository_1.ShopRepository();
    const service = new shop_service_1.ShopService(repository);
    return new shop_controller_1.ShopController(service);
};
exports.makeShopController = makeShopController;
