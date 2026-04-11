import { Router } from "express";

interface PaymentResult {
  requestKey: string;
  amount: number;
  currency: string;
  status: "processed" | "duplicate";
  processedAt: string;
}

const idempotencyStore = new Map<string, PaymentResult>();

export const case09bIdempotencyRouter = Router();

case09bIdempotencyRouter.post("/payment", (req, res) => {
  const requestKey = String(req.header("idempotency-key") ?? "").trim();
  const amount = Number(req.body.amount ?? 0);
  const currency = String(req.body.currency ?? "USD");

  if (!requestKey) {
    res.status(400).json({ error: "Missing idempotency-key header" });
    return;
  }

  if (amount <= 0) {
    res.status(400).json({ error: "amount must be greater than 0" });
    return;
  }

  const existing = idempotencyStore.get(requestKey);
  if (existing) {
    res.status(200).json({
      case: "09b-idempotency",
      ...existing,
      status: "duplicate"
    });
    return;
  }

  const result: PaymentResult = {
    requestKey,
    amount,
    currency,
    status: "processed",
    processedAt: new Date().toISOString()
  };

  idempotencyStore.set(requestKey, result);
  res.status(201).json({ case: "09b-idempotency", ...result });
});

case09bIdempotencyRouter.get("/store", (_req, res) => {
  res.json({
    case: "09b-idempotency",
    count: idempotencyStore.size,
    data: Array.from(idempotencyStore.values())
  });
});
