const FALLBACK_QUOTES = [
  { id: "1", content: "代码是写给人看的，顺便能在机器上运行。", author: "Donald Knuth", category: "编程" },
  { id: "2", content: "Talk is cheap. Show me the code.", author: "Linus Torvalds", category: "编程" },
  { id: "3", content: "程序员的三大美德：懒惰、急躁和傲慢。", author: "Larry Wall", category: "编程" },
  { id: "4", content: "简单是可靠性的先决条件。", author: "Edsger W. Dijkstra", category: "编程" },
  { id: "5", content: "过早的优化是万恶之源。", author: "Donald Knuth", category: "编程" },
  { id: "6", content: "代码改变世界。", author: "Unknown", category: "编程" },
  { id: "7", content: "技术永无止境。", author: "Unknown", category: "编程" },
];

export async function onRequestGet(): Promise<Response> {
  try {
    const response = await fetch("https://v1.hitokoto.cn/?c=i&encode=json");
    if (response.ok) {
      const data = await response.json();
      const quote = {
        id: data.id?.toString() || Date.now().toString(),
        content: data.hitokoto,
        author: data.from || "未知",
      };
      return new Response(JSON.stringify({ success: true, data: quote }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    throw new Error("API failed");
  } catch (error) {
    const quote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
    return new Response(JSON.stringify({ success: true, data: quote }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
