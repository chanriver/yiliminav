import { Home, Search, FolderOpen, Settings } from "lucide-react";
import { ThemeMode } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

type TabType = "home" | "search" | "categories" | "settings";

interface BottomNavProps {
  themeMode: ThemeMode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenSettings: () => void;
  isZenMode?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  themeMode,
  activeTab,
  onTabChange,
  onOpenSettings,
  isZenMode,
}) => {
  const { t } = useLanguage();
  const isDark = themeMode === ThemeMode.Dark;

  if (isZenMode) return null;

  const tabs: Array<{ id: TabType; icon: typeof Home; label: string }> = [
    { id: "home", icon: Home, label: t("home") || "首页" },
    { id: "search", icon: Search, label: t("search") || "搜索" },
    { id: "categories", icon: FolderOpen, label: t("categories") || "分类" },
    { id: "settings", icon: Settings, label: t("settings") || "设置" },
  ];

  const handleTabClick = (tabId: TabType) => {
    if (tabId === "settings") {
      onOpenSettings();
    } else {
      onTabChange(tabId);
    }
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-all duration-300 ${
        isDark
          ? "bg-slate-900/90 border-t border-white/10"
          : "bg-white/90 border-t border-black/10"
      } backdrop-blur-lg`}
    >
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[60px] ${
                isActive
                  ? isDark
                    ? "text-white"
                    : "text-slate-800"
                  : isDark
                  ? "text-white/40"
                  : "text-slate-400"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? isDark
                      ? "bg-[var(--theme-primary)]/20"
                      : "bg-[var(--theme-primary)]/10"
                    : ""
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
