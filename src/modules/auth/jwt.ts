import jwt from "jsonwebtoken"
import { env } from "../../config/env"

export type UserRole = "admin" | "developer" | "viewer"

export interface AuthClaims {
  sub: string
  role: UserRole
}

const tokenIssuer = "backend-study-lab"
const tokenAudience = "backend-study-lab-users"

export function signToken(claims: AuthClaims): string {
  return jwt.sign(claims, env.jwtSecret, {
    algorithm: "HS256",
    expiresIn: "2h",
    issuer: tokenIssuer,
    audience: tokenAudience,
  })
}

export function verifyToken(token: string): AuthClaims {
  return jwt.verify(token, env.jwtSecret, {
    algorithms: ["HS256"],
    issuer: tokenIssuer,
    audience: tokenAudience,
  }) as AuthClaims
}
