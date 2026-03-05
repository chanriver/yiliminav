import { useState, useEffect, useCallback } from "react";
import { Quote, RefreshCw } from "lucide-react";
import { ThemeMode } from "../types";

interface QuoteData {
  id: string;
  content: string;
  author: string;
}

interface QuoteCardProps {
  themeMode: ThemeMode;
}

const FALLBACK_QUOTES: QuoteData[] = [
  { id: "1", content: "代码是写给人看的，顺便能在机器上运行。", author: "Donald Knuth" },
  { id: "2", content: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { id: "3", content: "程序员的三大美德：懒惰、急躁和傲慢。", author: "Larry Wall" },
  { id: "4", content: "简单是可靠性的先决条件。", author: "Edsger W. Dijkstra" },
  { id: "5", content: "过早的优化是万恶之源。", author: "Donald Knuth" },
];

export const QuoteCard: React.FC<QuoteCardProps> = ({ themeMode }) => {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const isDark = themeMode === ThemeMode.Dark;

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/quote");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setQuote(data.data);
        } else {
          throw new Error("Invalid response");
        }
      } else {
        throw new Error("API error");
      }
    } catch (err) {
      console.error("Quote fetch error:", err);
      const randomQuote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      setQuote(randomQuote);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuote();
    const interval = setInterval(fetchQuote, 20000);
    return () => clearInterval(interval);
  }, [fetchQuote]);

  const containerClasses = isDark
    ? "bg-gradient-to-r from-slate-900/60 to-slate-800/40 border border-white/5"
    : "bg-gradient-to-r from-white/60 to-slate-50/40 border border-black/5";

  return (
    <div
      className={`w-full max-w-2xl mx-auto mt-4 transition-all duration-500 ${containerClasses} rounded-xl backdrop-blur-md shadow-lg`}
    >
      <div className="px-6 py-4 flex items-start gap-4">
        <div
          className={`shrink-0 p-2 rounded-lg ${
            isDark ? "bg-white/10" : "bg-black/5"
          }`}
        >
          <Quote
            size={20}
            className={isDark ? "text-white/70" : "text-slate-600"}
          />
        </div>

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="space-y-2">
              <div
                className={`h-4 rounded animate-pulse ${
                  isDark ? "bg-white/10" : "bg-black/10"
                }`}
                style={{ width: "80%" }}
              />
              <div
                className={`h-3 rounded animate-pulse ${
                  isDark ? "bg-white/5" : "bg-black/5"
                }`}
                style={{ width: "40%" }}
              />
            </div>
          ) : quote ? (
            <>
              <p
                className={`text-sm leading-relaxed ${
                  isDark ? "text-white/80" : "text-slate-700"
                }`}
              >
                "{quote.content}"
              </p>
              <p
                className={`text-xs mt-2 ${
                  isDark ? "text-white/40" : "text-slate-400"
                }`}
              >
                — {quote.author}
              </p>
            </>
          ) : null}
        </div>

        <button
          onClick={fetchQuote}
          disabled={loading}
          className={`shrink-0 p-2 rounded-lg transition-all duration-300 ${
            isDark
              ? "hover:bg-white/10 text-white/40 hover:text-white/70"
              : "hover:bg-black/10 text-slate-400 hover:text-slate-600"
          } ${loading ? "animate-spin" : ""}`}
          title="换一句"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
};
