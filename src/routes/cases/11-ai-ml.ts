import { Router } from "express";
import { z } from "zod";
import { env } from "../../config/env";

const summarizeSchema = z.object({
  text: z.string().min(20)
});

function localSummary(text: string): string {
  const words = text.split(/\s+/).filter(Boolean);
  return words.slice(0, 24).join(" ") + (words.length > 24 ? " ..." : "");
}

export const case11AiMlRouter = Router();

case11AiMlRouter.post("/summarize", async (req, res) => {
  const parsed = summarizeSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (!env.aiProviderUrl) {
    res.json({
      case: "11-ai-ml",
      provider: "local-fallback",
      summary: localSummary(parsed.data.text)
    });
    return;
  }

  try {
    const response = await fetch(env.aiProviderUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: env.aiProviderKey ? `Bearer ${env.aiProviderKey}` : ""
      },
      body: JSON.stringify({ text: parsed.data.text })
    });

    if (!response.ok) {
      throw new Error(`AI provider failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { summary?: string };
    res.json({
      case: "11-ai-ml",
      provider: env.aiProviderUrl,
      summary: payload.summary ?? localSummary(parsed.data.text)
    });
  } catch (error) {
    res.status(502).json({
      case: "11-ai-ml",
      error: error instanceof Error ? error.message : "AI provider call failed",
      fallbackSummary: localSummary(parsed.data.text)
    });
  }
});
