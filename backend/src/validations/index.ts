import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().min(3, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required')
});

export const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be a valid 10-digit number'),
  addressLine1: z.string().min(5, 'House/Flat and street address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'PIN code must be a valid 6-digit Indian postal code'),
  landmark: z.string().optional(),
  isDefault: z.boolean().optional()
});

export const cartItemAddSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
  weight: z.string().optional(),
  quantity: z.number().int().min(1).default(1)
});

export const cartItemUpdateSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative')
});

export const couponValidateSchema = z.object({
  code: z.string().min(1, 'Coupon code is required')
});

export const reviewCreateSchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5 stars'),
  comment: z.string().min(5, 'Review comment must be at least 5 characters'),
  city: z.string().optional()
});

export const orderCreateSchema = z.object({
  addressId: z.string().optional(),
  shippingAddress: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string().optional(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    pincode: z.string()
  }).optional(),
  paymentMethod: z.enum(['UPI', 'CARDS', 'NETBANKING', 'COD']),
  couponCode: z.string().optional()
});

export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});
