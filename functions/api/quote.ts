interface Env {
  QUOTE_KV: KVNamespace;
}

const FALLBACK_QUOTES = [
  { id: "1", content: "代码是写给人看的，顺便能在机器上运行。", author: "Donald Knuth", category: "编程" },
  { id: "2", content: "Talk is cheap. Show me the code.", author: "Linus Torvalds", category: "编程" },
  { id: "3", content: "程序员的三大美德：懒惰、急躁和傲慢。", author: "Larry Wall", category: "编程" },
  { id: "4", content: "简单是可靠性的先决条件。", author: "Edsger W. Dijkstra", category: "编程" },
  { id: "5", content: "过早的优化是万恶之源。", author: "Donald Knuth", category: "编程" },
];

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  try {
    const { QUOTE_KV } = context.env;
    const today = new Date().toISOString().split("T")[0];
    const cacheKey = `quote:${today}`;

    if (QUOTE_KV) {
      const cached = await QUOTE_KV.get(cacheKey);
      if (cached) {
        return new Response(cached, {
          headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=86400" },
        });
      }
    }

    const response = await fetch("https://v1.hitokoto.cn/?c=i&encode=json");
    let quote;

    if (response.ok) {
      const data = await response.json();
      quote = {
        id: data.id?.toString() || Date.now().toString(),
        content: data.hitokoto,
        author: data.from || "未知",
        category: data.type || "名言",
      };
    } else {
      quote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
    }

    const result = JSON.stringify({
      success: true,
      data: quote,
    });

    if (QUOTE_KV) {
      await QUOTE_KV.put(cacheKey, result, { expirationTtl: 86400 });
    }

    return new Response(result, {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=86400" },
    });
  } catch (error) {
    console.error("Quote API error:", error);
    return new Response(
      JSON.stringify({
        success: true,
        data: FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)],
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}
