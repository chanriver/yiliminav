import { ThemeMode } from "../types";

interface MottoProps {
  themeMode: ThemeMode;
}

const MOTTO_TEXT = "宠辱不惊，闲看庭前花开花落；去留无意，漫随天外云卷云舒。";

export const Motto: React.FC<MottoProps> = ({ themeMode }) => {
  const isDark = themeMode === ThemeMode.Dark;

  const containerClasses = isDark
    ? "border-t border-white/5"
    : "border-t border-black/5";

  return (
    <footer
      className={`w-full py-6 mt-auto ${containerClasses}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <p
            className={`text-sm md:text-base font-light tracking-wider transition-all duration-700 ${
              isDark
                ? "text-white/30 hover:text-white/50"
                : "text-slate-400 hover:text-slate-600"
            }`}
            style={{
              fontFamily: '"Noto Serif SC", "Songti SC", serif',
            }}
          >
            {MOTTO_TEXT}
          </p>
        </div>
      </div>
    </footer>
  );
};
