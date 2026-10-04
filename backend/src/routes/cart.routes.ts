import { Router } from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from '../controllers/cart.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { cartItemAddSchema, cartItemUpdateSchema } from '../validations/index.js';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/items', validateBody(cartItemAddSchema), addItemToCart);
router.put('/items/:id', validateBody(cartItemUpdateSchema), updateCartItem);
router.delete('/items/:id', removeCartItem);
router.delete('/', clearCart);

export default router;
