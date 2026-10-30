import jwt from "jsonwebtoken";
import { HttpError } from "../errors.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(new HttpError(401, "Authentication required"));
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { next(new HttpError(401, "Invalid or expired token")); }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return next(new HttpError(403, "You do not have permission"));
    next();
  };
}
