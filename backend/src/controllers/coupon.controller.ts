import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { CouponType } from '@prisma/client';

export async function validateCoupon(req: Request, res: Response) {
  try {
    const { code, subtotal = 0 } = req.body;
    const normalizedCode = (code || '').trim().toUpperCase();

    if (!normalizedCode) {
      return sendError(res, 'Please provide a promo code.', 400);
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode }
    });

    if (!coupon || !coupon.isActive) {
      return sendError(res, 'Invalid or expired promo code.', 400);
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return sendError(res, 'This promo code has expired.', 400);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return sendError(res, 'This promo code has reached its maximum usage limit.', 400);
    }

    const parsedSubtotal = parseFloat(subtotal) || 0;
    if (parsedSubtotal > 0 && parsedSubtotal < coupon.minOrderAmount) {
      return sendError(
        res,
        `This promo code requires a minimum order value of ₹${coupon.minOrderAmount}.`,
        400
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.type === CouponType.PERCENT) {
      discountAmount = Math.round((parsedSubtotal * coupon.value) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(parsedSubtotal, coupon.value);
    }

    return sendSuccess(
      res,
      {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount,
        label: coupon.type === CouponType.PERCENT ? `${coupon.value}% Extra Off` : `₹${coupon.value} Flat Off`
      },
      'Coupon code applied successfully!'
    );
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to validate coupon', 500);
  }
}

// Admin: Get all coupons
export async function getCoupons(req: Request, res: Response) {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return sendSuccess(res, coupons, 'Coupons loaded');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to load coupons', 500);
  }
}

// Admin: Create coupon
export async function createCoupon(req: Request, res: Response) {
  try {
    const data = req.body;
    const created = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase().trim(),
        type: data.type === 'FIXED' ? CouponType.FIXED : CouponType.PERCENT,
        value: parseFloat(data.value),
        minOrderAmount: parseFloat(data.minOrderAmount || '0'),
        maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit, 10) : null,
        isActive: data.isActive !== undefined ? !!data.isActive : true
      }
    });
    return sendSuccess(res, created, 'Coupon created', 201);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to create coupon', 500);
  }
}
