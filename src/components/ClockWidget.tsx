import { useState, useEffect, useCallback } from "react";
import { Clock, Moon, Sun, Play, Pause, RotateCcw, X } from "lucide-react";
import { ThemeMode } from "../types";

interface ClockWidgetProps {
  themeMode: ThemeMode;
  onZenModeChange?: (isZen: boolean) => void;
}

const POMODORO_TIME = 25 * 60;

export const ClockWidget: React.FC<ClockWidgetProps> = ({ themeMode, onZenModeChange }) => {
  const [time, setTime] = useState(new Date());
  const [isZenMode, setIsZenMode] = useState(false);
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(POMODORO_TIME);
  const [showPomodoro, setShowPomodoro] = useState(false);

  const isDark = themeMode === ThemeMode.Dark;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPomodoroActive && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((prev) => {
          if (prev <= 1) {
            setIsPomodoroActive(false);
            return POMODORO_TIME;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPomodoroActive, pomodoroTime]);

  const toggleZenMode = useCallback(() => {
    const newMode = !isZenMode;
    setIsZenMode(newMode);
    onZenModeChange?.(newMode);
  }, [isZenMode, onZenModeChange]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
  };

  const formatFullTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const containerClasses = isDark
    ? "bg-slate-900/40 border border-white/5"
    : "bg-white/40 border border-black/5";

  const iconColor = isDark ? "text-white/60" : "text-slate-600";
  const timeColor = isDark ? "text-white/90" : "text-slate-800";
  const textColor = isDark ? "text-white/50" : "text-slate-500";

  return (
    <>
      <div
        className={`fixed left-4 top-1/2 -translate-y-1/2 z-50 transition-all duration-500 ${
          isZenMode ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div
          className={`${containerClasses} rounded-2xl backdrop-blur-md p-4 shadow-lg hover:shadow-xl transition-shadow duration-300`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="text-center">
              <div className={`text-3xl font-light tracking-wider ${timeColor}`}>
                {formatFullTime(time)}
              </div>
              <div className={`text-xs mt-1 ${textColor}`}>
                {formatDate(time)}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={toggleZenMode}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isDark
                    ? "hover:bg-white/10 text-white/60 hover:text-white"
                    : "hover:bg-black/10 text-slate-600 hover:text-slate-800"
                }`}
                title="禅定模式"
              >
                <Moon size={18} />
              </button>
              <button
                onClick={() => setShowPomodoro(!showPomodoro)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isDark
                    ? "hover:bg-white/10 text-white/60 hover:text-white"
                    : "hover:bg-black/10 text-slate-600 hover:text-slate-800"
                } ${isPomodoroActive ? "text-red-500" : ""}`}
                title="番茄钟"
              >
                <Clock size={18} />
              </button>
            </div>

            {showPomodoro && (
              <div className="w-full pt-2 border-t border-inherit mt-2">
                <div className="text-center mb-2">
                  <span className={`text-2xl font-mono ${isPomodoroActive ? "text-red-500" : timeColor}`}>
                    {formatTime(pomodoroTime)}
                  </span>
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setIsPomodoroActive(!isPomodoroActive)}
                    className={`p-1.5 rounded-lg transition-all ${
                      isDark ? "hover:bg-white/10" : "hover:bg-black/10"
                    }`}
                  >
                    {isPomodoroActive ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button
                    onClick={() => {
                      setPomodoroTime(POMODORO_TIME);
                      setIsPomodoroActive(false);
                    }}
                    className={`p-1.5 rounded-lg transition-all ${
                      isDark ? "hover:bg-white/10" : "hover:bg-black/10"
                    }`}
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isZenMode && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-xl"
          style={{
            background: isDark
              ? "radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)"
              : "radial-gradient(circle at center, #f8fafc 0%, #e2e8f0 100%)",
          }}
        >
          <button
            onClick={toggleZenMode}
            className={`absolute top-6 right-6 p-3 rounded-full transition-all duration-500 ${
              isDark
                ? "hover:bg-white/10 text-white/40 hover:text-white/70"
                : "hover:bg-black/10 text-slate-400 hover:text-slate-600"
            }`}
          >
            <X size={24} />
          </button>

          <div className="text-center animate-fade-in">
            <div
              className={`text-7xl md:text-9xl font-thin tracking-wider mb-4 ${
                isDark ? "text-white/80" : "text-slate-800"
              }`}
            >
              {formatFullTime(time)}
            </div>
            <div className={`text-lg ${textColor}`}>
              {formatDate(time)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
