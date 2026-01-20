import { DiscountRepository } from "./discount.repository";
import { DiscountService } from "./discount.service";
import { DiscountController } from "./discount.controller";

export const makeDiscountController = () => {
    const repository = new DiscountRepository();
    const service = new DiscountService(repository);
    return new DiscountController(service);
};
