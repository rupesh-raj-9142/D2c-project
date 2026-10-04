import { Router } from 'express';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress
} from '../controllers/address.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { addressSchema } from '../validations/index.js';

const router = Router();

router.use(authenticate);

router.get('/', getAddresses);
router.post('/', validateBody(addressSchema), createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;
