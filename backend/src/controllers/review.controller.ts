import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export async function getProductReviews(req: Request, res: Response) {
  try {
    const productId = req.params.productId as string;

    const product = await prisma.product.findFirst({
      where: { OR: [{ id: productId }, { slug: productId }] }
    });

    if (!product) return sendError(res, 'Product not found', 404);

    const reviews = await prisma.review.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    });

    const formatted = reviews.map((r) => ({
      id: r.id,
      name: r.userName || r.user.name,
      city: r.city || 'India',
      rating: r.rating,
      date: r.createdAt.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      avatar: (r.userName || r.user.name).substring(0, 2).toUpperCase(),
      product: product.name,
      review: r.comment,
      isVerifiedBuyer: r.isVerifiedBuyer
    }));

    return sendSuccess(res, formatted, 'Reviews retrieved');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch reviews', 500);
  }
}

export async function addReview(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Please sign in to submit a review.', 401);
    const productId = req.params.productId as string;
    const { rating, comment, city } = req.body;

    const product = await prisma.product.findFirst({
      where: { OR: [{ id: productId }, { slug: productId }] }
    });

    if (!product) return sendError(res, 'Product not found', 404);

    // Verify user purchased this product
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: {
          userId: req.user.id,
          status: { in: ['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] }
        }
      }
    });

    // Check duplicate review
    const existing = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: product.id,
          userId: req.user.id
        }
      }
    });

    if (existing) {
      return sendError(res, 'You have already submitted a review for this pickle.', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId: req.user.id,
        userName: user?.name || 'Customer',
        city: city || 'New Delhi',
        rating: parseInt(rating, 10),
        comment,
        isVerifiedBuyer: !!purchase
      }
    });

    // Recalculate average rating for product
    const allReviews = await prisma.review.findMany({
      where: { productId: product.id },
      select: { rating: true }
    });

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / (allReviews.length || 1);

    await prisma.product.update({
      where: { id: product.id },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewsCount: allReviews.length
      }
    });

    return sendSuccess(res, review, 'Review submitted successfully!', 201);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to submit review', 500);
  }
}

export async function updateReview(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const id = req.params.id as string;
    const { rating, comment } = req.body;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return sendError(res, 'Review not found', 404);

    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return sendError(res, 'Access denied', 403);
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        ...(rating ? { rating: parseInt(rating, 10) } : {}),
        ...(comment ? { comment } : {})
      }
    });

    return sendSuccess(res, updated, 'Review updated');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update review', 500);
  }
}

export async function deleteReview(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const id = req.params.id as string;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return sendError(res, 'Review not found', 404);

    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return sendError(res, 'Access denied', 403);
    }

    await prisma.review.delete({ where: { id } });
    return sendSuccess(res, null, 'Review deleted');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to delete review', 500);
  }
}
