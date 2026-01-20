"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeVendorRequestController = void 0;
const vendorRequest_repository_1 = require("./vendorRequest.repository");
const vendorRequest_service_1 = require("./vendorRequest.service");
const vendorRequest_controller_1 = require("./vendorRequest.controller");
const shop_repository_1 = require("../shop/shop.repository");
const makeVendorRequestController = () => {
    const repository = new vendorRequest_repository_1.VendorRequestRepository();
    const shopRepository = new shop_repository_1.ShopRepository();
    const service = new vendorRequest_service_1.VendorRequestService(repository, shopRepository);
    return new vendorRequest_controller_1.VendorRequestController(service);
};
exports.makeVendorRequestController = makeVendorRequestController;
