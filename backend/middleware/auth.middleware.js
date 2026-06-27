import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/errorHandler.js";

export const protect = (req, res, next) => {
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

    req.userId = decoded.userId;
    req.user = decoded;
    return next();
  } catch (error) {
    return next(error);
  }
};

export default { protect };
