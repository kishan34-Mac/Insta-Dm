import dotenv from "dotenv";

dotenv.config();

const env = {
  PORT: process.env.PORT,

  NODE_ENV:
    process.env.NODE_ENV,

  FRONTEND_URL:
    process.env.FRONTEND_URL,

  MONGO_URL:
    process.env.MONGO_URL,

  JWT_SECRET:
    process.env.JWT_SECRET,

  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET,

  JWT_EXPIRES_IN:
    process.env.JWT_EXPIRES_IN,

  JWT_REFRESH_EXPIRES_IN:
    process.env
      .JWT_REFRESH_EXPIRES_IN,

  META_VERIFY_TOKEN:
    process.env
      .META_VERIFY_TOKEN,

  FACEBOOK_APP_ID:
    process.env
      .FACEBOOK_APP_ID,

  FACEBOOK_APP_SECRET:
    process.env
      .FACEBOOK_APP_SECRET,

  INSTAGRAM_CLIENT_ID:
    process.env
      .INSTAGRAM_CLIENT_ID,

  INSTAGRAM_CLIENT_SECRET:
    process.env
      .INSTAGRAM_CLIENT_SECRET,

  INSTAGRAM_REDIRECT_URI:
    process.env
      .INSTAGRAM_REDIRECT_URI,

  RAZORPAY_KEY_ID:
    process.env.RAZORPAY_KEY_ID,

  RAZORPAY_KEY_SECRET:
    process.env.RAZORPAY_KEY_SECRET,

  RAZORPAY_WEBHOOK_SECRET:
    process.env.RAZORPAY_WEBHOOK_SECRET,

  RAZORPAY_CURRENCY:
    process.env.RAZORPAY_CURRENCY || "INR",
};

export default env;

