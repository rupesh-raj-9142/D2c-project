import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export async function getDashboardStats(req: Request, res: Response) {
  try {
    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      orders,
      pendingOrders,
      completedOrders,
      lowStockVariants
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count(),
      prisma.order.findMany({
        select: { totalAmount: true, paymentStatus: true }
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.productVariant.findMany({
        where: { stock: { lte: 20 } },
        include: { product: { select: { name: true, slug: true } } }
      })
    ]);

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'COMPLETED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return sendSuccess(
      res,
      {
        totalRevenue: Math.round(totalRevenue),
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingOrders,
        completedOrders,
        lowStockProducts: lowStockVariants.map((v) => ({
          product: v.product.name,
          weight: v.weight,
          stock: v.stock,
          sku: v.sku
        }))
      },
      'Dashboard stats loaded'
    );
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch dashboard stats', 500);
  }
}

export async function getAllOrders(req: Request, res: Response) {
  try {
    const { status, limit = '50', page = '1' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, parseInt(limit as string, 10));

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status as OrderStatus;
    }

    const [orders, count] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          user: { select: { name: true, email: true, phone: true } },
          items: true
        }
      }),
      prisma.order.count({ where })
    ]);

    return sendSuccess(
      res,
      {
        orders,
        pagination: { total: count, page: pageNum, limit: limitNum }
      },
      'Orders retrieved'
    );
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch orders', 500);
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!Object.values(OrderStatus).includes(status)) {
      return sendError(res, 'Invalid order status', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) return sendError(res, 'Order not found', 404);

    const updated = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id },
        data: { status }
      });

      // If cancelled by admin, restore inventory
      if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } }
          });
        }
      }

      return ord;
    });

    return sendSuccess(res, updated, 'Order status updated');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update order status', 500);
  }
}

export async function getAllCustomers(req: Request, res: Response) {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return sendSuccess(res, customers, 'Customers loaded');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch customers', 500);
  }
}

export async function updateVariantStock(req: Request, res: Response) {
  try {
    const variantId = req.params.variantId as string;
    const { stock } = req.body;

    const updated = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: parseInt(stock, 10) }
    });

    return sendSuccess(res, updated, 'Stock updated');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update stock', 500);
  }
}
