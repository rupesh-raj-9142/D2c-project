import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return sendError(res, 'An account with this email already exists.', 409);
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone || null,
        cart: {
          create: {}
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return sendSuccess(
      res,
      { user, token },
      'Account created successfully! Welcome to LAXMI.',
      201
    );
  } catch (err: any) {
    return sendError(res, err.message || 'Registration failed', 500);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const identifier = email.trim();

    // Find by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { phone: identifier }
        ]
      }
    });

    if (!user) {
      return sendError(res, 'Invalid credentials. User not found.', 401);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt
        },
        token
      },
      'Welcome back to LAXMI!'
    );
  } catch (err: any) {
    return sendError(res, err.message || 'Login failed', 500);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' }
        },
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { items: true }
        }
      }
    });

    if (!user) return sendError(res, 'User not found', 404);

    return sendSuccess(res, user, 'Profile loaded');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch user profile', 500);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { name, phone } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {})
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true
      }
    });

    return sendSuccess(res, updated, 'Profile updated successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update profile', 500);
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) return sendError(res, 'User not found', 404);

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return sendError(res, 'Incorrect current password.', 400);
    }

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed }
    });

    return sendSuccess(res, null, 'Password changed successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to change password', 500);
  }
}

export async function logout(req: Request, res: Response) {
  return sendSuccess(res, null, 'Signed out successfully');
}
