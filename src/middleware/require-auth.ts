import { NextFunction, Request, Response } from "express";
import { AuthClaims, UserRole, verifyToken } from "../modules/auth/jwt";

export function requireAuth(allowedRoles?: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.header("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid Authorization header" });
      return;
    }

    const token = authHeader.replace("Bearer ", "").trim();

    try {
      const claims = verifyToken(token);
      req.user = claims as AuthClaims;

      if (allowedRoles && !allowedRoles.includes(claims.role)) {
        res.status(403).json({ error: "Forbidden for this role" });
        return;
      }

      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}
