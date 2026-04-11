import crypto from "crypto"
import { Router } from "express"
import { env } from "../../config/env"

export const case15CiCdWebhookRouter = Router()

const GITHUB_SIGNATURE_HEADER = "x-hub-signature-256"

function signPayload(payload: string, secret: string): string {
  const digest = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
  return `sha256=${digest}`
}

case15CiCdWebhookRouter.post("/github", (req, res) => {
  const signature = String(req.header(GITHUB_SIGNATURE_HEADER) ?? "").trim()
  const event = String(req.header("x-github-event") ?? "unknown")
  const secret = String(env.githubWebhookSecret)

  if (!signature) {
    res.status(400).json({ error: "Missing x-hub-signature-256 header" })
    return
  }

  if (!signature.startsWith("sha256=")) {
    res.status(400).json({ error: "x-hub-signature-256 must use sha256=" })
    return
  }

  const payload = req.rawBody ?? JSON.stringify(req.body ?? {})
  const expected = signPayload(payload, secret)

  const expectedBuffer = Buffer.from(expected)
  const providedBuffer = Buffer.from(signature)

  if (expectedBuffer.length !== providedBuffer.length) {
    res.status(401).json({ case: "15-ci-cd-webhook", verified: false })
    return
  }

  const verified = crypto.timingSafeEqual(expectedBuffer, providedBuffer)

  if (!verified) {
    res.status(401).json({ case: "15-ci-cd-webhook", verified: false })
    return
  }

  res.json({
    case: "15-ci-cd-webhook",
    verified: true,
    event,
    nextStep: "Trigger CI/CD deployment workflow",
  })
})

case15CiCdWebhookRouter.post("/signature/generate", (req, res) => {
  const secret = String(env.githubWebhookSecret)
  const payload = req.rawBody ?? JSON.stringify(req.body ?? {})

  res.json({
    case: "15-ci-cd-webhook",
    payload,
    signature: signPayload(payload, secret),
    headerName: GITHUB_SIGNATURE_HEADER,
  })
})
