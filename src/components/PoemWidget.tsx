import { useState, useEffect, useCallback } from "react";
import { BookOpen, RefreshCw, Copy, Check } from "lucide-react";
import { ThemeMode } from "../types";

interface PoemData {
  content: string;
  author: string;
  title: string;
}

interface PoemWidgetProps {
  themeMode: ThemeMode;
  isZenMode?: boolean;
}

const FALLBACK_POEMS: PoemData[] = [
  { content: "明月几时有，把酒问青天。", author: "苏轼", title: "水调歌头" },
  { content: "大江东去，浪淘尽，千古风流人物。", author: "苏轼", title: "念奴娇" },
  { content: "人生若只如初见，何事秋风悲画扇。", author: "纳兰性德", title: "木兰花" },
  { content: "山重水复疑无路，柳暗花明又一村。", author: "陆游", title: "游山西村" },
  { content: "海上生明月，天涯共此时。", author: "张九龄", title: "望月怀远" },
  { content: "举头望明月，低头思故乡。", author: "李白", title: "静夜思" },
  { content: "春眠不觉晓，处处闻啼鸟。", author: "孟浩然", title: "春晓" },
  { content: "夕阳无限好，只是近黄昏。", author: "李商隐", title: "乐游原" },
];

export const PoemWidget: React.FC<PoemWidgetProps> = ({ themeMode, isZenMode }) => {
  const [poem, setPoem] = useState<PoemData | null>(null);
  const [displayedText, setDisplayedText] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showFull, setShowFull] = useState(false);

  const isDark = themeMode === ThemeMode.Dark;

  const fetchPoem = useCallback(async () => {
    setLoading(true);
    setDisplayedText("");
    setShowFull(false);
    try {
      const response = await fetch("/api/poem");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setPoem(data.data);
        } else {
          throw new Error("Invalid response");
        }
      } else {
        throw new Error("API error");
      }
    } catch (err) {
      console.error("Poem fetch error:", err);
      const randomPoem = FALLBACK_POEMS[Math.floor(Math.random() * FALLBACK_POEMS.length)];
      setPoem(randomPoem);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPoem();
    const interval = setInterval(fetchPoem, 20000);
    return () => clearInterval(interval);
  }, [fetchPoem]);

  useEffect(() => {
    if (!poem || loading) return;

    const text = poem.content;
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setShowFull(true);
      }
    }, 80);

    return () => clearInterval(timer);
  }, [poem, loading]);

  const handleCopy = async () => {
    if (!poem) return;
    const text = `${poem.content}\n— ${poem.author}《${poem.title}》`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const containerClasses = isDark
    ? "bg-slate-900/40 border border-white/5"
    : "bg-white/40 border border-black/5";

  if (isZenMode) return null;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 max-w-[200px] hidden lg:block">
      <div
        className={`${containerClasses} rounded-2xl backdrop-blur-md p-4 shadow-lg hover:shadow-xl transition-shadow duration-300`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center gap-2 ${isDark ? "text-white/60" : "text-slate-600"}`}>
            <BookOpen size={16} />
            <span className="text-xs font-medium">诗词</span>
          </div>
          <button
            onClick={fetchPoem}
            disabled={loading}
            className={`p-1 rounded transition-all duration-300 ${
              isDark
                ? "hover:bg-white/10 text-white/40 hover:text-white/70"
                : "hover:bg-black/10 text-slate-400 hover:text-slate-600"
            } ${loading ? "animate-spin" : ""}`}
            title="换一首"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="min-h-[80px]">
          {loading ? (
            <div className="space-y-2">
              <div
                className={`h-4 rounded animate-pulse ${
                  isDark ? "bg-white/10" : "bg-black/10"
                }`}
                style={{ width: "90%" }}
              />
              <div
                className={`h-4 rounded animate-pulse ${
                  isDark ? "bg-white/10" : "bg-black/10"
                }`}
                style={{ width: "70%" }}
              />
              <div
                className={`h-4 rounded animate-pulse ${
                  isDark ? "bg-white/10" : "bg-black/10"
                }`}
                style={{ width: "50%" }}
              />
            </div>
          ) : poem ? (
            <>
              <p
                className={`text-sm leading-relaxed ${
                  isDark ? "text-white/80" : "text-slate-700"
                }`}
              >
                {displayedText}
                {!showFull && <span className="animate-pulse">|</span>}
              </p>
              {showFull && (
                <p
                  className={`text-xs mt-2 ${
                    isDark ? "text-white/40" : "text-slate-400"
                  }`}
                >
                  — {poem.author}《{poem.title}》
                </p>
              )}
            </>
          ) : null}
        </div>

        {showFull && (
          <button
            onClick={handleCopy}
            className={`w-full mt-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all duration-300 ${
              isDark
                ? "hover:bg-white/10 text-white/40 hover:text-white/70"
                : "hover:bg-black/10 text-slate-400 hover:text-slate-600"
            }`}
          >
            {copied ? (
              <>
                <Check size={12} />
                已复制
              </>
            ) : (
              <>
                <Copy size={12} />
                复制
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
