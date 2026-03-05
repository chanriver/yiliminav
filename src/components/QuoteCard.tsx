import { Quote, RefreshCw } from "lucide-react";
import { ThemeMode } from "../types";
import { useQuote } from "../hooks/useSWR";

interface QuoteCardProps {
  themeMode: ThemeMode;
}

const FALLBACK_QUOTES = [
  { id: "1", content: "代码是写给人看的，顺便能在机器上运行。", author: "Donald Knuth" },
  { id: "2", content: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { id: "3", content: "程序员的三大美德：懒惰、急躁和傲慢。", author: "Larry Wall" },
  { id: "4", content: "简单是可靠性的先决条件。", author: "Edsger W. Dijkstra" },
  { id: "5", content: "过早的优化是万恶之源。", author: "Donald Knuth" },
];

export const QuoteCard: React.FC<QuoteCardProps> = ({ themeMode }) => {
  const { quote, isLoading, mutate } = useQuote();
  const isDark = themeMode === ThemeMode.Dark;

  const fetchQuote = () => {
    mutate();
  };

  const displayQuote = quote || FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];

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
          {isLoading ? (
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
          ) : (
            <>
              <p
                className={`text-sm leading-relaxed ${
                  isDark ? "text-white/80" : "text-slate-700"
                }`}
              >
                "{displayQuote.content}"
              </p>
              <p
                className={`text-xs mt-2 ${
                  isDark ? "text-white/40" : "text-slate-400"
                }`}
              >
                — {displayQuote.author}
              </p>
            </>
          )}
        </div>

        <button
          onClick={fetchQuote}
          disabled={isLoading}
          className={`shrink-0 p-2 rounded-lg transition-all duration-300 ${
            isDark
              ? "hover:bg-white/10 text-white/40 hover:text-white/70"
              : "hover:bg-black/10 text-slate-400 hover:text-slate-600"
          } ${isLoading ? "animate-spin" : ""}`}
          title="换一句"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
};
