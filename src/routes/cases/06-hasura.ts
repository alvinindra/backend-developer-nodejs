import { Router } from "express";

export const case06HasuraRouter = Router();

case06HasuraRouter.post("/action/greet", (req, res) => {
  const session = req.body.session_variables ?? {};
  const input = req.body.input ?? {};

  const name = typeof input.name === "string" ? input.name : "developer";
  const role = session["x-hasura-role"] ?? "unknown";

  res.json({
    case: "06-hasura",
    message: `Hello ${name}, request accepted for role ${role}`
  });
});

case06HasuraRouter.post("/event/order-created", (req, res) => {
  const event = req.body.event;

  res.json({
    case: "06-hasura",
    received: true,
    eventId: event?.id ?? null,
    table: event?.data?.old ? "update/delete" : "insert"
  });
});
