import { callMiniMax, buildSystemPrompt, MiniMaxMessage } from "./minimax";

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
    const { url, title, existingCategories = [] } = body;

    if (!url || !title) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "URL and title are required" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const messages: MiniMaxMessage[] = [
      { role: "system", content: buildSystemPrompt("classify") },
      {
        role: "user",
        content: `网址: ${url}\n标题: ${title}\n可用分类: ${existingCategories.join(", ")}\n请判断这个链接应该归到哪个分类。`,
      },
    ];

    const result = await callMiniMax(MINIMAX_API_KEY, messages);

    let classification = {
      category: existingCategories[0] || "未分类",
      confidence: 0.5,
      reason: "根据网址判断",
    };

    try {
      const parsed = JSON.parse(result);
      if (parsed.category) {
        classification = {
          category: parsed.category,
          confidence: parsed.confidence || 0.8,
          reason: parsed.reason || "AI智能归类",
        };
      }
    } catch {
      console.warn("Failed to parse classification:", result);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: classification,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Classify API error:", error);
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
