import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export async function getAddresses(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Please sign in', 401);

    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });

    return sendSuccess(res, addresses, 'Addresses loaded');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch addresses', 500);
  }
}

export async function createAddress(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Please sign in', 401);
    const data = req.body;

    // Validate 6-digit Indian pincode
    if (!/^[1-9][0-9]{5}$/.test(data.pincode)) {
      return sendError(res, 'Invalid Indian PIN code. Must be 6 digits.', 400);
    }

    // If marked default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false }
      });
    }

    // If first address, make it default automatically
    const count = await prisma.address.count({ where: { userId: req.user.id } });
    const isDefault = data.isDefault !== undefined ? data.isDefault : count === 0;

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        fullName: data.fullName,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        landmark: data.landmark || null,
        isDefault
      }
    });

    return sendSuccess(res, address, 'Address added successfully', 201);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to add address', 500);
  }
}

export async function updateAddress(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Please sign in', 401);
    const id = req.params.id as string;
    const data = req.body;

    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) return sendError(res, 'Address not found', 404);

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false }
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data
    });

    return sendSuccess(res, updated, 'Address updated');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update address', 500);
  }
}

export async function deleteAddress(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Please sign in', 401);
    const id = req.params.id as string;

    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) return sendError(res, 'Address not found', 404);

    await prisma.address.delete({ where: { id } });
    return sendSuccess(res, null, 'Address deleted');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to delete address', 500);
  }
}
