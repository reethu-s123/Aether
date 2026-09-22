import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "", showLabel = false }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      id="theme-toggle-btn"
      onClick={toggleTheme}
      className={`relative flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-xl border transition-all duration-300 ${
        isDark
          ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white"
          : "bg-slate-100 border-slate-300 hover:bg-slate-200 hover:border-slate-400 text-slate-900 shadow-sm"
      } ${className}`}
      title={`Switch to ${isDark ? "High-Contrast Light Mode" : "Aether Dark Theme"}`}
      aria-label="Toggle visual theme"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Moon size={15} className="text-emerald-400 transition-transform duration-300 rotate-0" />
        ) : (
          <Sun size={15} className="text-amber-600 transition-transform duration-300 rotate-0" />
        )}
      </div>

      {showLabel ? (
        <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">
          {isDark ? "Dark" : "Light"}
        </span>
      ) : (
        <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline opacity-80">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
