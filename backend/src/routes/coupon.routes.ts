import { Router } from 'express';
import { validateCoupon, getCoupons, createCoupon } from '../controllers/coupon.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { couponValidateSchema } from '../validations/index.js';

const router = Router();

router.post('/validate', validateBody(couponValidateSchema), validateCoupon);
router.get('/', authenticate, requireAdmin, getCoupons);
router.post('/', authenticate, requireAdmin, createCoupon);

export default router;
