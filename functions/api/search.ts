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
    const { query, bookmarks = [], limit = 5 } = body;

    if (!query) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Query is required" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const bookmarkTexts = bookmarks
      .slice(0, 20)
      .map((b: { id: string; title: string; url: string; category?: string }) =>
        `- ${b.title} (${b.url}) [分类: ${b.category || "未分类"}]`
      )
      .join("\n");

    const messages: MiniMaxMessage[] = [
      { role: "system", content: buildSystemPrompt("search") },
      {
        role: "user",
        content: `用户搜索词: ${query}\n书签数据:\n${bookmarkTexts}\n请找出最匹配的书签，返回前${limit}个。`,
      },
    ];

    const result = await callMiniMax(MINIMAX_API_KEY, messages);

    let results: Array<{
      id: string;
      title: string;
      url: string;
      category?: string;
      score: number;
      reason: string;
    }> = [];

    try {
      const parsed = JSON.parse(result);
      if (Array.isArray(parsed)) {
        results = parsed.slice(0, limit).map((item: {
          id?: string;
          title?: string;
          url?: string;
          category?: string;
          score?: number;
          reason?: string;
        }) => ({
          id: item.id || "",
          title: item.title || "",
          url: item.url || "",
          category: item.category,
          score: item.score || 0.8,
          reason: item.reason || "AI智能匹配",
        }));
      }
    } catch {
      console.warn("Failed to parse search results:", result);
      const lines = result.split("\n").filter((l: string) => l.includes("http"));
      results = lines.slice(0, limit).map((line: string) => {
        const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
        const titleMatch = line.match(/[-*]\s+([^(]+)/);
        return {
          id: "",
          title: titleMatch ? titleMatch[1].trim() : urlMatch?.[0] || "",
          url: urlMatch ? urlMatch[0] : "",
          score: 0.7,
          reason: "关键词匹配",
        };
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: { results },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Search API error:", error);
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
