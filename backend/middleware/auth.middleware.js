import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/errorHandler.js";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token = req.cookies?.accessToken;
  const authHeader = req.headers.authorization;

  if (!token && authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // check query string for token on OAuth redirects
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return next(new AppError("Not authorized to access this route", 401));
  }

  try {
    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.userId) {
      return next(new AppError("Invalid session payload", 401));
    }

    // Explicit verification of user existence and lock status
    const user = await User.findById(decoded.userId).select("+lockUntil role plan");
    if (!user) {
      return next(new AppError("User session no longer valid", 401));
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return next(new AppError("Account is locked. Contact support.", 423));
    }

    req.userId = user._id.toString();
    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Access token expired", 401));
    }
    return next(new AppError("Invalid authentication token", 401));
  }
};

export default { protect };
