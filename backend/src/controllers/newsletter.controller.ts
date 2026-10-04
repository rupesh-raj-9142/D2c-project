import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function subscribeNewsletter(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: cleanEmail }
    });

    if (existing) {
      return sendSuccess(
        res,
        { email: cleanEmail },
        'You are already subscribed to the LAXMI Parivaar newsletter!'
      );
    }

    const subscriber = await prisma.newsletterSubscriber.create({
      data: { email: cleanEmail }
    });

    return sendSuccess(
      res,
      subscriber,
      'Welcome to LAXMI Parivaar! Use coupon GHARKASWAD for 10% off your first order.',
      201
    );
  } catch (err: any) {
    return sendError(res, err.message || 'Newsletter subscription failed', 500);
  }
}
