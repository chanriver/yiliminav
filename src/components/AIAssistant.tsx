import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, User, ExternalLink, Loader2 } from "lucide-react";
import { ThemeMode } from "../types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: Array<{
    type: "link";
    title: string;
    url: string;
  }>;
}

interface AIAssistantProps {
  themeMode: ThemeMode;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ themeMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "你好！我是 AI 导航助手。告诉我你想找什么网站，我可以帮你推荐～",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isDark = themeMode === ThemeMode.Dark;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-6),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.data.reply,
            suggestions: data.data.suggestions,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "抱歉，我现在有点忙，请稍后再试～",
          },
        ]);
      }
    } catch (err) {
      console.error("AI chat error:", err);
      const fallbackResponses = [
        "好的，我帮你找到了几个相关的网站导航：",
        "根据你的需求，我推荐以下几个分类：",
        "让我来帮你搜索一下～",
      ];
      const fallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: fallback,
          suggestions: [
            { type: "link", title: "编程开发", url: "?category=dev" },
            { type: "link", title: "设计资源", url: "?category=design" },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const containerClasses = isDark
    ? "bg-slate-900/80 border border-white/10"
    : "bg-white/80 border border-black/10";

  const bubbleUser = isDark
    ? "bg-[var(--theme-primary)] text-white"
    : "bg-[var(--theme-primary)] text-white";

  const bubbleAssistant = isDark
    ? "bg-white/10 text-white/80"
    : "bg-black/5 text-slate-700";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-6 right-4 z-50 p-3 rounded-full transition-all duration-300 ${
          isDark
            ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-white/10 text-white/70 hover:text-white"
            : "bg-gradient-to-br from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 border border-black/10 text-slate-600 hover:text-slate-800"
        } shadow-lg hover:shadow-xl hover:scale-110`}
        title="AI 助手"
      >
        <Sparkles size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div
            className={`relative w-full max-w-lg h-[600px] ${containerClasses} rounded-2xl backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden`}
          >
            <div
              className={`flex items-center justify-between px-4 py-3 border-b ${
                isDark ? "border-white/10" : "border-black/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                  <Sparkles size={16} className="text-white" />
                </div>
                <span className={`font-medium ${isDark ? "text-white" : "text-slate-800"}`}>
                  AI 导航助手
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-black/10 text-slate-600"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.role === "user" ? "bg-[var(--theme-primary)]" : "bg-gradient-to-br from-purple-500 to-blue-500"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User size={14} className="text-white" />
                    ) : (
                      <Bot size={14} className="text-white" />
                    )}
                  </div>
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                      msg.role === "user" ? bubbleUser : bubbleAssistant
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.suggestions.map((suggestion, idx) => (
                          <a
                            key={idx}
                            href={suggestion.url}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                              isDark
                                ? "bg-white/5 hover:bg-white/10 text-white/70"
                                : "bg-black/5 hover:bg-black/10 text-slate-600"
                            }`}
                          >
                            <ExternalLink size={12} />
                            <span className="text-xs">{suggestion.title}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className={`px-4 py-2 rounded-2xl ${bubbleAssistant}`}>
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div
              className={`p-4 border-t ${isDark ? "border-white/10" : "border-black/10"}`}
            >
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                  isDark ? "bg-white/5 border border-white/10" : "bg-black/5 border border-black/10"
                }`}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="告诉我你想找什么..."
                  className={`flex-1 bg-transparent outline-none text-sm ${
                    isDark ? "text-white placeholder:text-white/40" : "text-slate-700 placeholder:text-slate-400"
                  }`}
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className={`p-2 rounded-lg transition-all ${
                    input.trim() && !loading
                      ? "bg-[var(--theme-primary)] text-white hover:opacity-90"
                      : isDark
                      ? "text-white/30"
                      : "text-slate-400"
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
