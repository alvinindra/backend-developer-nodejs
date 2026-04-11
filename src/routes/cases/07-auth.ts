import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/require-auth";
import { UserRole, signToken } from "../../modules/auth/jwt";

const loginSchema = z.object({
  username: z.string().min(2),
  role: z.enum(["admin", "developer", "viewer"]).default("developer")
});

export const case07AuthRouter = Router();

case07AuthRouter.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const role = parsed.data.role as UserRole;

  const token = signToken({
    sub: parsed.data.username,
    role
  });

  res.json({
    case: "07-auth",
    token,
    user: { username: parsed.data.username, role }
  });
});

case07AuthRouter.get("/profile", requireAuth(), (req, res) => {
  res.json({ case: "07-auth", profile: req.user, requestId: req.requestId });
});

case07AuthRouter.get("/admin", requireAuth(["admin"]), (req, res) => {
  res.json({ case: "07-auth", ok: true, message: `Welcome admin ${req.user?.sub}` });
});
