import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { makeCartService } from '../cart/cart.factory';

export const makeAuthController = () => {
  const repository = new AuthRepository();
  const authService = new AuthService(repository);
  const cartService = makeCartService();
  return new AuthController(authService, cartService);
};