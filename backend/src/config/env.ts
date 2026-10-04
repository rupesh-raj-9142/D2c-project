import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/laxmi_db?schema=public',
  jwtSecret: process.env.JWT_SECRET || 'laxmi_super_secure_jwt_secret_d2c_pickle_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  shipping: {
    freeThreshold: 499,
    standardFee: 49 // Per requirements: Orders below ₹499: ₹49 shipping; Orders ₹499 or above: FREE shipping
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_laxmi_demo',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_laxmi'
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'laxmi-pickles',
    apiKey: process.env.CLOUDINARY_API_KEY || 'mock_cloudinary_key',
    apiSecret: process.env.CLOUDINARY_API_SECRET || 'mock_cloudinary_secret'
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    user: process.env.SMTP_USER || 'demo_user',
    pass: process.env.SMTP_PASS || 'demo_password',
    from: process.env.EMAIL_FROM || 'care@laxmipickles.com'
  }
};
