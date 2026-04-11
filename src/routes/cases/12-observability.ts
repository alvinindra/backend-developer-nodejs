import { Router } from "express"
import { getLogFormat, log } from "../../modules/observability/logger"

export const case12ObservabilityRouter = Router()

case12ObservabilityRouter.get("/", (req, res) => {
  log("info", "observability_case_hit", {
    requestId: req.requestId,
    route: "/cases/12-observability",
    userAgent: req.header("user-agent"),
  })

  res.json({
    case: "12-observability",
    requestId: req.requestId,
    logFormat: getLogFormat(),
  })
})
