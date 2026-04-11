import { Pool, QueryResult, QueryResultRow } from "pg"
import { env } from "../../config/env"

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: env.databaseUrl,
    })
  }

  return pool
}

export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params)
}

export async function closePool(): Promise<void> {
  if (!pool) {
    return
  }

  const activePool = pool
  pool = null
  await activePool.end()
}
