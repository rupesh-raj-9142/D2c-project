import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { config } from '../config/env.js';

// Helper to get or create cart for authenticated user
async function getUserCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { images: true }
          },
          variant: true
        }
      }
    }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true }
            },
            variant: true
          }
        }
      }
    });
  }

  return cart;
}

// Calculate totals securely on backend
function calculateCartTotals(items: any[], couponDiscount = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  const mrpTotal = items.reduce(
    (sum, item) => sum + (item.variant.originalPrice || item.variant.price) * item.quantity,
    0
  );
  const productSavings = Math.max(0, mrpTotal - subtotal);
  const delivery = subtotal >= config.shipping.freeThreshold || subtotal === 0 ? 0 : config.shipping.standardFee;
  const grandTotal = Math.max(0, subtotal - couponDiscount + delivery);
  const freeDeliveryRemaining = Math.max(0, config.shipping.freeThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / config.shipping.freeThreshold) * 100));

  return {
    subtotal,
    mrpTotal,
    productSavings,
    couponDiscount,
    delivery,
    grandTotal,
    freeDeliveryRemaining,
    freeDeliveryProgress,
    isFreeDelivery: delivery === 0 && subtotal > 0
  };
}

export async function getCart(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 'Please sign in to access cart', 401);
    }

    const cart = await getUserCart(req.user.id);

    const formattedItems = cart.items.map((item) => {
      const primaryImage =
        item.product.images.find((img) => img.isPrimary)?.url ||
        item.product.images[0]?.url ||
        '/assets/images/hero-pickle.jpg';

      return {
        id: item.id,
        cartItemId: `${item.product.slug}-${item.variant.weight}`,
        productId: item.product.slug,
        dbProductId: item.productId,
        variantId: item.variantId,
        name: item.product.name,
        hindiName: item.product.hindiName || '',
        weight: item.variant.weight,
        price: item.variant.price,
        originalPrice: item.variant.originalPrice || item.variant.price,
        image: primaryImage,
        quantity: item.quantity,
        stock: item.variant.stock
      };
    });

    const totals = calculateCartTotals(cart.items);

    return sendSuccess(
      res,
      {
        cartId: cart.id,
        items: formattedItems,
        totalItems: formattedItems.reduce((acc, i) => acc + i.quantity, 0),
        totals
      },
      'Cart retrieved'
    );
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to retrieve cart', 500);
  }
}

export async function addItemToCart(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Please sign in', 401);
    const { productId, variantId, weight, quantity = 1 } = req.body;

    // Find product by id or slug
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: productId }, { slug: productId }] },
      include: { variants: true }
    });

    if (!product) return sendError(res, 'Product not found', 404);

    // Find variant
    let variant = null;
    if (variantId) {
      variant = product.variants.find((v) => v.id === variantId);
    } else if (weight) {
      variant = product.variants.find((v) => v.weight.toLowerCase() === weight.toLowerCase());
    }
    if (!variant) {
      variant = product.variants[0];
    }

    if (!variant) return sendError(res, 'Product variant not found', 404);

    // Verify stock
    if (variant.stock < quantity) {
      return sendError(res, `Only ${variant.stock} units available in stock.`, 400);
    }

    const cart = await getUserCart(req.user.id);

    // Upsert cart item
    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: variant.id
        }
      }
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (variant.stock < newQty) {
        return sendError(res, `Cannot add more. Stock limit of ${variant.stock} reached.`, 400);
      }
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          variantId: variant.id,
          quantity
        }
      });
    }

    return getCart(req, res);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to add item to cart', 500);
  }
}

export async function updateCartItem(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const id = req.params.id as string;
    const { quantity } = req.body;

    const cart = await getUserCart(req.user.id);

    const item = await prisma.cartItem.findFirst({
      where: {
        id,
        cartId: cart.id
      },
      include: { variant: true }
    });

    if (!item) {
      return sendError(res, 'Item not found in your cart', 404);
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      if (item.variant.stock < quantity) {
        return sendError(res, `Only ${item.variant.stock} units in stock.`, 400);
      }
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity }
      });
    }

    return getCart(req, res);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update item', 500);
  }
}

export async function removeCartItem(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const id = req.params.id as string;
    const cart = await getUserCart(req.user.id);

    // Support deletion by item ID or composite slug-weight
    const item = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        OR: [
          { id },
          {
            variant: {
              OR: [
                { id },
                { weight: id }
              ]
            }
          }
        ]
      }
    });

    if (item) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    }

    return getCart(req, res);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to remove item', 500);
  }
}

export async function clearCart(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const cart = await getUserCart(req.user.id);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return sendSuccess(res, null, 'Cart cleared');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to clear cart', 500);
  }
}
