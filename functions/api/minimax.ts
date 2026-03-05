export interface MiniMaxMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface MiniMaxRequest {
  model: string;
  messages: MiniMaxMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface MiniMaxResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callMiniMax(
  apiKey: string,
  messages: MiniMaxMessage[],
  options?: {
    temperature?: number;
    max_tokens?: number;
  }
): Promise<string> {
  const request: MiniMaxRequest = {
    model: "MiniMax-M2.5",
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.max_tokens ?? 2048,
    stream: false,
  };

  const response = await fetch("https://api.minimax.chat/v1/text/chatcompletion_v2", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MiniMax API error: ${response.status} - ${error}`);
  }

  const data: MiniMaxResponse = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error("No response from MiniMax");
  }

  return data.choices[0].message.content;
}

export function buildSystemPrompt(type: "chat" | "recommend" | "search" | "classify"): string {
  const prompts = {
    chat: `你是一个友好的网站导航助手。你的任务是帮助用户找到他们需要的网站。
请用简洁友好的语言回答问题。
如果用户询问网站推荐，可以根据他们的需求推荐合适的分类或网站。
当有合适的网站推荐时，给出网站名称和简短说明。`,

    recommend: `你是一个网站分类推荐助手。
根据用户的需求，从提供的分类列表中选择最合适的分类。
返回JSON格式: {"category": "分类名", "confidence": 0.95, "reason": "简短原因"}`,

    search: `你是一个搜索引擎助手。
根据用户的自然语言搜索词，从书签列表中找到最匹配的结果。
返回JSON格式: [{"id": "书签ID", "title": "标题", "url": "链接", "score": 0.9, "reason": "匹配原因"}]`,

    classify: `你是一个网站分类助手。
根据网址和标题，判断这个网站应该归到哪个分类。
返回JSON格式: {"category": "分类名", "confidence": 0.95, "reason": "分类原因"}`,
  };

  return prompts[type];
}
