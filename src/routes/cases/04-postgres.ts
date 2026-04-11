import { Router } from "express";
import { query } from "../../modules/db/pool";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2)
});

export const case04PostgresRouter = Router();

case04PostgresRouter.post("/setup", async (_req, res) => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS study_users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_study_users_created_at ON study_users(created_at DESC);
    `);

    res.json({ case: "04-postgres", message: "study_users table ready" });
  } catch (error) {
    res.status(500).json({
      case: "04-postgres",
      error: error instanceof Error ? error.message : "Could not connect to Postgres"
    });
  }
});

case04PostgresRouter.post("/users", async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await query<{ id: number; email: string; name: string; created_at: string }>(
      "INSERT INTO study_users(email, name) VALUES($1, $2) RETURNING id, email, name, created_at",
      [parsed.data.email, parsed.data.name]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Insert failed" });
  }
});

case04PostgresRouter.get("/users", async (_req, res) => {
  try {
    const result = await query<{ id: number; email: string; name: string; created_at: string }>(
      "SELECT id, email, name, created_at FROM study_users ORDER BY created_at DESC LIMIT 100"
    );
    res.json({ case: "04-postgres", count: result.rowCount, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Query failed" });
  }
});
