interface Env {
  POEM_KV: KVNamespace;
}

const FALLBACK_POEMS = [
  { content: "明月几时有，把酒问青天。", author: "苏轼", title: "水调歌头", dynasty: "宋" },
  { content: "大江东去，浪淘尽，千古风流人物。", author: "苏轼", title: "念奴娇", dynasty: "宋" },
  { content: "人生若只如初见，何事秋风悲画扇。", author: "纳兰性德", title: "木兰花", dynasty: "清" },
  { content: "山重水复疑无路，柳暗花明又一村。", author: "陆游", title: "游山西村", dynasty: "宋" },
  { content: "海上生明月，天涯共此时。", author: "张九龄", title: "望月怀远", dynasty: "唐" },
  { content: "举头望明月，低头思故乡。", author: "李白", title: "静夜思", dynasty: "唐" },
  { content: "春眠不觉晓，处处闻啼鸟。", author: "孟浩然", title: "春晓", dynasty: "唐" },
  { content: "夕阳无限好，只是近黄昏。", author: "李商隐", title: "乐游原", dynasty: "唐" },
];

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  try {
    const { POEM_KV } = context.env;
    const hour = new Date().getHours();
    const cacheKey = `poem:${hour}`;

    if (POEM_KV) {
      const cached = await POEM_KV.get(cacheKey);
      if (cached) {
        return new Response(cached, {
          headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
        });
      }
    }

    const response = await fetch("https://api.jinrishici.com/v1/random");
    let poem;

    if (response.ok) {
      const data = await response.json();
      poem = {
        content: data.data.content,
        author: data.data.author,
        title: data.data.origin,
        dynasty: data.data.dynasty,
      };
    } else {
      poem = FALLBACK_POEMS[Math.floor(Math.random() * FALLBACK_POEMS.length)];
    }

    const result = JSON.stringify({
      success: true,
      data: poem,
    });

    if (POEM_KV) {
      await POEM_KV.put(cacheKey, result, { expirationTtl: 3600 });
    }

    return new Response(result, {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
    });
  } catch (error) {
    console.error("Poem API error:", error);
    return new Response(
      JSON.stringify({
        success: true,
        data: FALLBACK_POEMS[Math.floor(Math.random() * FALLBACK_POEMS.length)],
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}
