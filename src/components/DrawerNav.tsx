import { useState, useEffect, useRef } from "react";
import { Menu, X, Home, Search, FolderOpen, Settings, Sun, Moon, Globe, ChevronRight } from "lucide-react";
import { ThemeMode } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

interface Category {
  id: string;
  title: string;
  icon?: string;
  subCategories?: Array<{
    id: string;
    title: string;
    items: Array<{ id: string; title: string; url: string }>;
  }>;
}

interface DrawerNavProps {
  themeMode: ThemeMode;
  categories: Category[];
  activeCategory: string;
  activeSubCategoryId: string | null;
  onCategoryClick: (categoryId: string) => void;
  onSubCategoryClick: (categoryId: string, subCategoryId: string) => void;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  openSettings: () => void;
  isZenMode?: boolean;
}

export const DrawerNav: React.FC<DrawerNavProps> = ({
  themeMode,
  categories,
  activeCategory,
  activeSubCategoryId,
  onCategoryClick,
  onSubCategoryClick,
  toggleTheme,
  toggleLanguage,
  openSettings,
  isZenMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const isDark = themeMode === ThemeMode.Dark;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        if (e.touches[0].clientX > 280) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener("touchstart", handleTouchStart);
    }

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, [isOpen]);

  if (isZenMode) return null;

  const handleCategoryClick = (categoryId: string) => {
    onCategoryClick(categoryId);
    const hasSubCategories = categories.find((c) => c.id === categoryId)?.subCategories?.length;
    if (hasSubCategories && hasSubCategories > 0) {
      setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    } else {
      setIsOpen(false);
    }
  };

  const handleSubCategoryClick = (categoryId: string, subCategoryId: string) => {
    onSubCategoryClick(categoryId, subCategoryId);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-4 left-4 z-50 p-2.5 rounded-xl transition-all duration-300 lg:hidden ${
          isDark
            ? "bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 text-white/80"
            : "bg-white/60 hover:bg-white/80 border border-black/10 text-slate-700"
        } backdrop-blur-md shadow-lg`}
      >
        <Menu size={22} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[150] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        </div>
      )}

      <div
        ref={drawerRef}
        className={`fixed top-0 left-0 h-full w-[300px] z-[160] transform transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: isDark
            ? "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)"
            : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? "border-white/10" : "border-black/10"}`}>
          <span className={`font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
            {t("navigation") || "导航"}
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-black/10 text-slate-600"}`}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {categories.map((category) => (
            <div key={category.id}>
              <button
                onClick={() => handleCategoryClick(category.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                  activeCategory === category.id
                    ? isDark
                      ? "bg-[var(--theme-primary)]/20 text-white"
                      : "bg-[var(--theme-primary)]/10 text-slate-800"
                    : isDark
                    ? "hover:bg-white/5 text-white/70"
                    : "hover:bg-black/5 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderOpen size={18} />
                  <span className="font-medium">{category.title}</span>
                </div>
                {category.subCategories && category.subCategories.length > 0 && (
                  <ChevronRight
                    size={16}
                    className={`transition-transform duration-200 ${expandedCategory === category.id ? "rotate-90" : ""}`}
                  />
                )}
              </button>

              {category.subCategories && category.subCategories.length > 0 && expandedCategory === category.id && (
                <div className="ml-6 mt-1 space-y-1">
                  {category.subCategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubCategoryClick(category.id, sub.id)}
                      className={`w-full text-left p-2.5 rounded-lg text-sm transition-all duration-200 ${
                        activeSubCategoryId === sub.id
                          ? isDark
                            ? "bg-white/10 text-white"
                            : "bg-black/10 text-slate-800"
                          : isDark
                          ? "hover:bg-white/5 text-white/50"
                          : "hover:bg-black/5 text-slate-600"
                      }`}
                    >
                      {sub.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className={`p-4 border-t space-y-2 ${isDark ? "border-white/10" : "border-black/10"}`}>
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
              isDark ? "hover:bg-white/5 text-white/70" : "hover:bg-black/5 text-slate-700"
            }`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDark ? t("light_mode") || "浅色模式" : t("dark_mode") || "深色模式"}</span>
          </button>

          <button
            onClick={toggleLanguage}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
              isDark ? "hover:bg-white/5 text-white/70" : "hover:bg-black/5 text-slate-700"
            }`}
          >
            <Globe size={18} />
            <span>{t("language") || "语言"}</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              openSettings();
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
              isDark ? "hover:bg-white/5 text-white/70" : "hover:bg-black/5 text-slate-700"
            }`}
          >
            <Settings size={18} />
            <span>{t("settings") || "设置"}</span>
          </button>
        </div>
      </div>
    </>
  );
};
