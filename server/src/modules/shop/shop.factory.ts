import { ShopRepository } from "./shop.repository";
import { ShopService } from "./shop.service";
import { ShopController } from "./shop.controller";

export const makeShopController = () => {
    const repository = new ShopRepository();
    const service = new ShopService(repository);
    return new ShopController(service);
};
