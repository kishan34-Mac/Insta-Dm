import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/errorHandler.js";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Not authorized to access this route", 401));
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    req.userId = decoded.userId;
    req.user = decoded;
    return next();
  } catch (error) {
    return next(error);
  }
};

export default { protect };
