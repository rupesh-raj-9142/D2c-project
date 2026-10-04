import { Router } from 'express';
import { subscribeNewsletter } from '../controllers/newsletter.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { newsletterSchema } from '../validations/index.js';

const router = Router();

router.post('/subscribe', validateBody(newsletterSchema), subscribeNewsletter);

export default router;
