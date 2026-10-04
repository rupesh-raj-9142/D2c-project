import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { config } from '../config/env.js';
import { OrderStatus, PaymentMethod, PaymentStatus, CouponType } from '@prisma/client';

export async function createOrder(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required to place an order.', 401);
    }

    const { addressId, shippingAddress, paymentMethod = 'COD', couponCode } = req.body;

    // 1. Retrieve cart with variants and products
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            variant: true
          }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return sendError(res, 'Your cart is empty. Add products before placing an order.', 400);
    }

    // 2. Verify stock and calculate subtotal using current database prices
    let subtotal = 0;
    for (const item of cart.items) {
      if (item.variant.stock < item.quantity) {
        return sendError(
          res,
          `Insufficient stock for ${item.product.name} (${item.variant.weight}). Only ${item.variant.stock} available.`,
          400
        );
      }
      subtotal += item.variant.price * item.quantity;
    }

    // 3. Validate coupon if provided
    let discountAmount = 0;
    let validCouponCode: string | null = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() }
      });

      if (coupon && coupon.isActive && subtotal >= coupon.minOrderAmount) {
        if (!coupon.expiryDate || new Date() <= coupon.expiryDate) {
          if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
            validCouponCode = coupon.code;
            if (coupon.type === CouponType.PERCENT) {
              discountAmount = Math.round((subtotal * coupon.value) / 100);
              if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
              }
            } else {
              discountAmount = Math.min(subtotal, coupon.value);
            }

            // Increment coupon usage count
            await prisma.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: { increment: 1 } }
            });
          }
        }
      }
    }

    // 4. Calculate shipping fee
    const shippingFee = subtotal >= config.shipping.freeThreshold ? 0 : config.shipping.standardFee;
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

    // 5. Determine Address Snapshot
    let resolvedAddress = shippingAddress;
    let dbAddressId = addressId || null;

    if (!resolvedAddress && dbAddressId) {
      const dbAddr = await prisma.address.findFirst({
        where: { id: dbAddressId, userId: req.user.id }
      });
      if (dbAddr) {
        resolvedAddress = {
          name: dbAddr.fullName,
          phone: dbAddr.phone,
          address1: dbAddr.addressLine1,
          address2: dbAddr.addressLine2,
          city: dbAddr.city,
          state: dbAddr.state,
          pincode: dbAddr.pincode
        };
      }
    }

    if (!resolvedAddress) {
      return sendError(res, 'Please provide a valid delivery address.', 400);
    }

    // 6. Generate unique order number (e.g. LXMI-492817)
    const orderNumber = `LXMI-${Math.floor(100000 + Math.random() * 900000)}`;

    // Initial status: COD is CONFIRMED immediately, online methods start PENDING until verified
    const isOnline = paymentMethod !== 'COD';
    const initialStatus = isOnline ? OrderStatus.PENDING : OrderStatus.CONFIRMED;
    const initialPayStatus = isOnline ? PaymentStatus.PENDING : PaymentStatus.PENDING;

    // 7. Atomic transaction: Create Order + OrderItems + Deduct stock + Clear Cart
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: req.user!.id,
          addressId: dbAddressId,
          shippingAddress: resolvedAddress,
          status: initialStatus,
          paymentMethod: paymentMethod as PaymentMethod,
          paymentStatus: initialPayStatus,
          subtotal,
          discountAmount,
          shippingFee,
          totalAmount,
          couponCode: validCouponCode,
          items: {
            create: cart.items.map((item) => {
              const primaryImage =
                item.product.images.find((img) => img.isPrimary)?.url ||
                item.product.images[0]?.url ||
                '/assets/images/hero-pickle.jpg';

              return {
                productId: item.productId,
                variantId: item.variantId,
                productName: item.product.name,
                weight: item.variant.weight,
                unitPrice: item.variant.price,
                quantity: item.quantity,
                totalPrice: item.variant.price * item.quantity,
                image: primaryImage
              };
            })
          }
        },
        include: { items: true }
      });

      // If COD / confirmed: decrease inventory immediately
      if (initialStatus === OrderStatus.CONFIRMED) {
        for (const item of cart.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }

      // Clear cart items
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return createdOrder;
    });

    return sendSuccess(
      res,
      {
        orderId: order.orderNumber,
        dbId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totals: {
          subtotal: order.subtotal,
          discount: order.discountAmount,
          shipping: order.shippingFee,
          grandTotal: order.totalAmount
        },
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        items: order.items,
        date: order.createdAt
      },
      'Order placed successfully!',
      201
    );
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to place order', 500);
  }
}

export async function getOrders(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        payments: true
      }
    });

    const formatted = orders.map((o) => ({
      orderId: o.orderNumber,
      dbId: o.id,
      date: o.createdAt.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      shippingAddress: o.shippingAddress,
      totals: {
        subtotal: o.subtotal,
        discount: o.discountAmount,
        shipping: o.shippingFee,
        grandTotal: o.totalAmount
      },
      items: o.items
    }));

    return sendSuccess(res, formatted, 'Orders loaded');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch orders', 500);
  }
}

export async function getOrderById(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const id = req.params.id as string;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
        ...(req.user.role !== 'ADMIN' ? { userId: req.user.id } : {})
      },
      include: {
        items: true,
        payments: true,
        user: { select: { name: true, email: true, phone: true } }
      }
    });

    if (!order) return sendError(res, 'Order not found', 404);

    return sendSuccess(res, order, 'Order details loaded');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch order', 500);
  }
}

export async function cancelOrder(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const id = req.params.id as string;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
        ...(req.user.role !== 'ADMIN' ? { userId: req.user.id } : {})
      },
      include: { items: true }
    });

    if (!order) return sendError(res, 'Order not found', 404);

    if (order.status === OrderStatus.CANCELLED) {
      return sendError(res, 'Order is already cancelled', 400);
    }

    if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
      return sendError(res, 'Cannot cancel an order that is already shipped or delivered.', 400);
    }

    // Cancel order and restore inventory
    const cancelled = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED }
      });

      // Restore stock for confirmed orders
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } }
        });
      }

      return updated;
    });

    return sendSuccess(res, cancelled, 'Order cancelled and stock restored');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to cancel order', 500);
  }
}
