import { ThemeMode } from "../types";

interface MottoProps {
  themeMode: ThemeMode;
}

const MOTTO_LEFT = "宠辱不惊，闲看庭前花开花落";
const MOTTO_RIGHT = "去留无意，漫随天外云卷云舒";

export const Motto: React.FC<MottoProps> = ({ themeMode }) => {
  const isDark = themeMode === ThemeMode.Dark;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 pointer-events-none ${
        isDark ? "border-t border-white/5" : "border-t border-black/5"
      }`}
      style={{
        background: isDark
          ? "linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent)"
          : "linear-gradient(to top, rgba(248, 250, 252, 0.9), transparent)",
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center text-sm md:text-base">
          <p
            className={`transition-all duration-700 ${
              isDark
                ? "text-white/30 hover:text-white/50"
                : "text-slate-400 hover:text-slate-600"
            }`}
            style={{
              fontFamily: '"Noto Serif SC", "Songti SC", serif',
            }}
          >
            {MOTTO_LEFT}
          </p>
          <p
            className={`transition-all duration-700 ${
              isDark
                ? "text-white/30 hover:text-white/50"
                : "text-slate-400 hover:text-slate-600"
            }`}
            style={{
              fontFamily: '"Noto Serif SC", "Songti SC", serif',
            }}
          >
            {MOTTO_RIGHT}
          </p>
        </div>
      </div>
    </div>
  );
};
