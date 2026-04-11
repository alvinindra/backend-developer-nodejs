import { Router } from "express";

export const case01HealthRouter = Router();

case01HealthRouter.get("/", (req, res) => {
  res.json({
    case: "01-health",
    status: "ok",
    requestId: req.requestId,
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString()
  });
});
