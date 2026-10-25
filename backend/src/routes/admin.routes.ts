import { Router } from 'express';
import {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllCustomers,
  updateVariantStock
} from '../controllers/admin.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/customers', getAllCustomers);
router.put('/variants/:variantId/stock', updateVariantStock);

export default router;
