import { CartRepository } from './cart.repository';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';


export const makeCartService = () => {
  const repository = new CartRepository();
  return new CartService(repository);
};

export const makeCartController = () => {
  const service = makeCartService();
  return new CartController(service);
};