import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export async function getWishlist(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Please sign in', 401);

    const items = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            variants: { orderBy: { price: 'asc' } },
            images: { orderBy: { sortOrder: 'asc' } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const productIds = items.map((i) => i.product.slug);
    const formatted = items.map((i) => {
      const p = i.product;
      const primaryImage =
        p.images.find((img) => img.isPrimary)?.url ||
        p.images[0]?.url ||
        '/assets/images/hero-pickle.jpg';

      return {
        id: p.slug,
        dbId: p.id,
        name: p.name,
        price: p.variants[0]?.price || 199,
        image: primaryImage
      };
    });

    return sendSuccess(
      res,
      {
        productIds,
        items: formatted
      },
      'Wishlist loaded'
    );
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch wishlist', 500);
  }
}

export async function addToWishlist(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Please sign in', 401);
    const productId = req.params.productId as string;

    const product = await prisma.product.findFirst({
      where: { OR: [{ id: productId }, { slug: productId }] }
    });

    if (!product) return sendError(res, 'Product not found', 404);

    // Prevent duplicate
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: product.id
        }
      }
    });

    if (!existing) {
      await prisma.wishlist.create({
        data: {
          userId: req.user.id,
          productId: product.id
        }
      });
    }

    return getWishlist(req, res);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to add to wishlist', 500);
  }
}

export async function removeFromWishlist(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Please sign in', 401);
    const productId = req.params.productId as string;

    const product = await prisma.product.findFirst({
      where: { OR: [{ id: productId }, { slug: productId }] }
    });

    if (product) {
      await prisma.wishlist.deleteMany({
        where: {
          userId: req.user.id,
          productId: product.id
        }
      });
    }

    return getWishlist(req, res);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to remove from wishlist', 500);
  }
}
