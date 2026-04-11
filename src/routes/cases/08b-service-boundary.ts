import { Router } from "express";
import { randomInt } from "crypto";

const inMemoryInventory = new Map<string, number>([
  ["laptop", 5],
  ["keyboard", 10],
  ["monitor", 4]
]);

function simulateNetworkLatency(): Promise<void> {
  const ms = randomInt(15, 80);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function inventoryReserve(sku: string, quantity: number): Promise<{ reserved: boolean; reason?: string }> {
  await simulateNetworkLatency();

  const available = inMemoryInventory.get(sku) ?? 0;
  if (available < quantity) {
    return { reserved: false, reason: `insufficient stock (${available})` };
  }

  inMemoryInventory.set(sku, available - quantity);
  return { reserved: true };
}

async function paymentAuthorize(amount: number): Promise<{ authorized: boolean; reason?: string }> {
  await simulateNetworkLatency();

  if (amount > 5000) {
    return { authorized: false, reason: "amount exceeds authorization threshold" };
  }

  return { authorized: true };
}

export const case08bServiceBoundaryRouter = Router();

case08bServiceBoundaryRouter.post("/checkout", async (req, res) => {
  const sku = String(req.body.sku ?? "laptop");
  const quantity = Number(req.body.quantity ?? 1);
  const amount = Number(req.body.amount ?? 1000);

  if (!sku || quantity <= 0 || amount <= 0) {
    res.status(400).json({ error: "Invalid checkout payload" });
    return;
  }

  const reservation = await inventoryReserve(sku, quantity);
  if (!reservation.reserved) {
    res.status(409).json({ case: "08b-service-boundary", step: "inventory", ...reservation });
    return;
  }

  const payment = await paymentAuthorize(amount);
  if (!payment.authorized) {
    const rollback = (inMemoryInventory.get(sku) ?? 0) + quantity;
    inMemoryInventory.set(sku, rollback);
    res.status(402).json({ case: "08b-service-boundary", step: "payment", ...payment });
    return;
  }

  res.status(201).json({
    case: "08b-service-boundary",
    status: "order_confirmed",
    sku,
    quantity,
    amount
  });
});

case08bServiceBoundaryRouter.get("/inventory", (_req, res) => {
  const data = Array.from(inMemoryInventory.entries()).map(([sku, quantity]) => ({ sku, quantity }));
  res.json({ case: "08b-service-boundary", data });
});
