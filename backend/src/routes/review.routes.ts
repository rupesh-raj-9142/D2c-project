import { Router } from 'express';
import {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview
} from '../controllers/review.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { reviewCreateSchema } from '../validations/index.js';

const router = Router();

router.get('/products/:productId/reviews', getProductReviews);
router.post('/products/:productId/reviews', authenticate, validateBody(reviewCreateSchema), addReview);
router.put('/reviews/:id', authenticate, updateReview);
router.delete('/reviews/:id', authenticate, deleteReview);

export default router;
