import { Router } from "express";
import { getPool, query } from "../../modules/db/pool";

export const case04bPostgresTransactionsRouter = Router();

case04bPostgresTransactionsRouter.post("/setup", async (_req, res) => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS wallet_accounts (
        id SERIAL PRIMARY KEY,
        owner TEXT UNIQUE NOT NULL,
        balance NUMERIC NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS wallet_transfers (
        id SERIAL PRIMARY KEY,
        from_owner TEXT NOT NULL,
        to_owner TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      INSERT INTO wallet_accounts(owner, balance)
      VALUES ('alice', 1000), ('bob', 500)
      ON CONFLICT (owner) DO NOTHING;
    `);

    res.json({ case: "04b-postgres-transactions", message: "wallet tables ready" });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Setup failed" });
  }
});

case04bPostgresTransactionsRouter.post("/transfer", async (req, res) => {
  const fromOwner = String(req.body.fromOwner ?? "alice");
  const toOwner = String(req.body.toOwner ?? "bob");
  const amount = Number(req.body.amount ?? 0);

  if (!fromOwner || !toOwner || fromOwner === toOwner || amount <= 0) {
    res.status(400).json({ error: "Invalid transfer input" });
    return;
  }

  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    const source = await client.query<{ balance: string }>(
      "SELECT balance FROM wallet_accounts WHERE owner = $1 FOR UPDATE",
      [fromOwner]
    );

    if (source.rowCount === 0) {
      throw new Error(`Source owner not found: ${fromOwner}`);
    }

    const currentBalance = Number(source.rows[0].balance);
    if (currentBalance < amount) {
      throw new Error("Insufficient balance");
    }

    const target = await client.query<{ owner: string }>(
      "SELECT owner FROM wallet_accounts WHERE owner = $1 FOR UPDATE",
      [toOwner]
    );

    if (target.rowCount === 0) {
      throw new Error(`Target owner not found: ${toOwner}`);
    }

    await client.query("UPDATE wallet_accounts SET balance = balance - $1 WHERE owner = $2", [
      amount,
      fromOwner
    ]);
    await client.query("UPDATE wallet_accounts SET balance = balance + $1 WHERE owner = $2", [
      amount,
      toOwner
    ]);
    await client.query(
      "INSERT INTO wallet_transfers(from_owner, to_owner, amount) VALUES ($1, $2, $3)",
      [fromOwner, toOwner, amount]
    );

    await client.query("COMMIT");

    res.json({
      case: "04b-postgres-transactions",
      transferred: { fromOwner, toOwner, amount }
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(400).json({ error: error instanceof Error ? error.message : "Transfer failed" });
  } finally {
    client.release();
  }
});

case04bPostgresTransactionsRouter.get("/balances", async (_req, res) => {
  try {
    const result = await query<{ owner: string; balance: string }>(
      "SELECT owner, balance::text AS balance FROM wallet_accounts ORDER BY owner ASC"
    );
    res.json({ case: "04b-postgres-transactions", data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Read failed" });
  }
});
