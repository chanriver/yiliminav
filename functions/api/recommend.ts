import { callMiniMax, buildSystemPrompt, MiniMaxMessage } from "../ai/minimax";

interface Env {
  MINIMAX_API_KEY: string;
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  try {
    const { MINIMAX_API_KEY } = context.env;

    if (!MINIMAX_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "CONFIG_ERROR", message: "MiniMax API key not configured" },
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await context.request.json();
    const { query, categories = [] } = body;

    if (!query) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Query is required" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const messages: MiniMaxMessage[] = [
      { role: "system", content: buildSystemPrompt("recommend") },
      {
        role: "user",
        content: `用户需求: ${query}\n可用分类: ${categories.join(", ")}\n请推荐最合适的分类。`,
      },
    ];

    const result = await callMiniMax(MINIMAX_API_KEY, messages);

    let recommendation = {
      category: categories[0] || "未分类",
      confidence: 0.5,
      reason: "根据您的需求推荐",
    };

    try {
      const parsed = JSON.parse(result);
      if (parsed.category) {
        recommendation = {
          category: parsed.category,
          confidence: parsed.confidence || 0.8,
          reason: parsed.reason || "AI智能推荐",
        };
      }
    } catch {
      console.warn("Failed to parse recommendation:", result);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          recommendation,
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Recommend API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: "AI_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
