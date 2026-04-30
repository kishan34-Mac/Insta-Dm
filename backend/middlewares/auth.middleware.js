import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/errorHandler.js";

/**
 * Authentication Middleware
 * Protects routes using JWT authentication
 */

//

// @desc    Protect routes - verify JWT access token
export const protect = async (req, res, next) => {
  try {
    // Get token from header
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new AppError("Not authorized to access this route", 401);
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Add user ID to request
    req.userId = decoded.userId;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      next(new AppError("Token expired", 401));
    } else {
      next(new AppError("Not authorized to access this route", 401));
    }
  }
};

export default { protect };
