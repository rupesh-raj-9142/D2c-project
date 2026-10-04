import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  paymentWebhook
} from '../controllers/payment.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/create-order', authenticate, createPaymentOrder);
router.post('/verify', authenticate, verifyPayment);
router.post('/webhook', paymentWebhook);

export default router;
