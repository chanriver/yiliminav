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
    const { message, history = [] } = body;

    if (!message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Message is required" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const messages: MiniMaxMessage[] = [
      { role: "system", content: buildSystemPrompt("chat") },
    ];

    for (const msg of history.slice(-6)) {
      messages.push({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      });
    }

    messages.push({ role: "user", content: message });

    const reply = await callMiniMax(MINIMAX_API_KEY, messages);

    const suggestions = extractSuggestions(reply);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          reply,
          suggestions,
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat API error:", error);
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

function extractSuggestions(text: string): Array<{ type: "link"; title: string; url: string }> {
  const suggestions: Array<{ type: "link"; title: string; url: string }> = [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const lines = text.split("\n");

  for (const line of lines) {
    const urlMatch = line.match(urlRegex);
    if (urlMatch) {
      const title = line.replace(urlRegex, "").replace(/^[-\d.、\s]+/, "").trim() || urlMatch[0];
      suggestions.push({
        type: "link",
        title: title.slice(0, 50),
        url: urlMatch[0],
      });
      if (suggestions.length >= 3) break;
    }
  }

  return suggestions;
}
