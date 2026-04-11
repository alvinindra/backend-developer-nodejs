export type LogLevel = "info" | "warn" | "error"

type LogMeta = Record<string, unknown>

type LogFormat = "pretty" | "json"

const ANSI_RESET = "\x1b[0m"
const ANSI_BOLD = "\x1b[1m"
const ANSI_DIM = "\x1b[2m"
const ANSI_BLUE = "\x1b[34m"
const ANSI_YELLOW = "\x1b[33m"
const ANSI_RED = "\x1b[31m"

function shouldUsePrettyLogs(): boolean {
  const configuredFormat = process.env.LOG_FORMAT?.toLowerCase()

  if (configuredFormat === "json") {
    return false
  }

  if (configuredFormat === "pretty") {
    return true
  }

  return process.env.NODE_ENV !== "production"
}

function supportsColor(): boolean {
  return Boolean(process.stdout.isTTY && !process.env.NO_COLOR)
}

function levelColor(level: LogLevel): string {
  if (!supportsColor()) {
    return ""
  }

  if (level === "warn") {
    return ANSI_YELLOW
  }

  if (level === "error") {
    return ANSI_RED
  }

  return ANSI_BLUE
}

function prettyMeta(meta: LogMeta): string {
  const keys = Object.keys(meta)
  if (keys.length === 0) {
    return ""
  }

  try {
    const body = JSON.stringify(meta, null, 2)
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n")

    return `\n${body}`
  } catch {
    return "\n  [unserializable metadata]"
  }
}

function formatPrettyLine(
  level: LogLevel,
  message: string,
  timestamp: string,
  meta: LogMeta,
): string {
  const levelText = level.toUpperCase().padEnd(5, " ")
  const color = levelColor(level)
  const reset = supportsColor() ? ANSI_RESET : ""
  const dim = supportsColor() ? ANSI_DIM : ""
  const bold = supportsColor() ? ANSI_BOLD : ""

  return `${dim}${timestamp}${reset} ${color}${bold}${levelText}${reset} ${message}${prettyMeta(meta)}`
}

export function getLogFormat(): LogFormat {
  return shouldUsePrettyLogs() ? "pretty" : "json"
}

export function log(
  level: LogLevel,
  message: string,
  meta: LogMeta = {},
): void {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    pid: process.pid,
    ...meta,
  }

  const line =
    getLogFormat() === "pretty"
      ? formatPrettyLine(level, message, entry.timestamp, meta)
      : JSON.stringify(entry)

  if (level === "error") {
    console.error(line)
    return
  }

  if (level === "warn") {
    console.warn(line)
    return
  }

  console.log(line)
}
