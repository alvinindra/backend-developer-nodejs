import { Router } from "express";
import {
  createOrderWithOutbox,
  ensureAsyncTables,
  getOutboxState,
  processNextOutboxEvent
} from "../../modules/worker/async-store";
import { env } from "../../config/env";

export const case08MicroservicesRouter = Router();

case08MicroservicesRouter.post("/setup", async (_req, res) => {
  try {
    await ensureAsyncTables();
    res.json({ case: "08-microservices", message: "service_orders and outbox_events are ready" });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Setup failed" });
  }
});

case08MicroservicesRouter.post("/orders", async (req, res) => {
  const customerId = String(req.body.customerId ?? "unknown-customer");
  const amount = Number(req.body.amount ?? 0);

  if (amount <= 0) {
    res.status(400).json({ error: "amount must be greater than 0" });
    return;
  }

  try {
    const created = await createOrderWithOutbox(customerId, amount);
    res.status(201).json({
      case: "08-microservices",
      orderId: created.orderId,
      outboxEventId: created.outboxEventId
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Order create failed" });
  }
});

case08MicroservicesRouter.post("/process-outbox", async (_req, res) => {
  try {
    const processed = await processNextOutboxEvent(env.workerId);
    res.json({ case: "08-microservices", ...processed });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Outbox processing failed" });
  }
});

case08MicroservicesRouter.get("/state", async (_req, res) => {
  try {
    const state = await getOutboxState();
    res.json({ case: "08-microservices", ...state });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "State query failed" });
  }
});
