import User from "../models/User.js";
import { AppError } from "../utils/errorHandler.js";

export const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("role");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (user.role !== "admin") {
      return next(new AppError("Admin access required", 403));
    }

    req.admin = user;

    next();
  } catch (error) {
    next(error);
  }
};
