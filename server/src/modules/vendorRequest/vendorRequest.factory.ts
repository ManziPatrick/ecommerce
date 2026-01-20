import { VendorRequestRepository } from "./vendorRequest.repository";
import { VendorRequestService } from "./vendorRequest.service";
import { VendorRequestController } from "./vendorRequest.controller";
import { ShopRepository } from "../shop/shop.repository";

export const makeVendorRequestController = () => {
    const repository = new VendorRequestRepository();
    const shopRepository = new ShopRepository();
    const service = new VendorRequestService(repository, shopRepository);
    return new VendorRequestController(service);
};
