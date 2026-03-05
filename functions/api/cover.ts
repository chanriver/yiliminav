import { callMiniMax, MiniMaxMessage } from "./minimax";

interface Env {
  MINIMAX_API_KEY: string;
  AI_COVERS: R2Bucket;
}

const COVER_STYLES = {
  modern: "现代简约风格，渐变色调，抽象几何图形",
  minimal: "极简风格，大量留白，简洁线条",
  colorful: "色彩鲜艳，波普艺术风格，充满活力",
};

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  try {
    const { MINIMAX_API_KEY, AI_COVERS } = context.env;

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
    const { category, style = "modern" } = body;

    if (!category) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Category is required" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const prompt = `请为"${category}"分类生成一个简洁的封面图像描述（用于AI生成图片）。
描述要求：${COVER_STYLES[style as keyof typeof COVER_STYLES] || COVER_STYLES.modern}
请用英文描述，返回一个简洁的图像生成提示词（不超过100个单词）。`;

    const messages: MiniMaxMessage[] = [
      { role: "system", content: "你是一个图像提示词生成助手。请生成简洁的英文图像描述。" },
      { role: "user", content: prompt },
    ];

    const imagePrompt = await callMiniMax(MINIMAX_API_KEY, messages, {
      max_tokens: 500,
    });

    const imageUrl = await generateImage(MINIMAX_API_KEY, imagePrompt.trim(), category);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          coverUrl: imageUrl,
          thumbnailUrl: imageUrl,
          prompt: imagePrompt,
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cover API error:", error);
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

async function generateImage(
  apiKey: string,
  prompt: string,
  category: string
): Promise<string> {
  const response = await fetch(
    "https://api.minimax.chat/v1/image_generation",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "MiniMax-01",
        prompt,
        num_inference_steps: 20,
        seed: Math.floor(Math.random() * 1000000),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Image generation failed: ${response.status}`);
  }

  const data = await response.json();
  return data.data?.[0]?.url || "";
}
