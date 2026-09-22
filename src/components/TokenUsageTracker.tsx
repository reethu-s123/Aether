import { motion } from "motion/react";
import { Zap, Crown, AlertTriangle, ArrowUpRight, Sparkles } from "lucide-react";

interface TokenUsageTrackerProps {
  usedTokens: number;
  totalLimit: number;
  onOpenUpgrade: () => void;
  onSimulateTokens?: (tokens: number) => void;
  planName?: string;
}

export default function TokenUsageTracker({
  usedTokens,
  totalLimit,
  onOpenUpgrade,
  onSimulateTokens,
  planName = "Free Tier",
}: TokenUsageTrackerProps) {
  const percentage = Math.min(100, Math.round((usedTokens / totalLimit) * 100));
  const isNearLimit = usedTokens >= 800000;
  const isExceeded = usedTokens >= totalLimit;
  const remainingTokens = Math.max(0, totalLimit - usedTokens);

  return (
    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 relative overflow-hidden group hover:border-white/20 transition-all">
      {/* Background glow on approaching limit */}
      {isNearLimit && (
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 blur-xl pointer-events-none" />
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              isNearLimit ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-400"
            }`}
          >
            <Zap size={13} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-primary block leading-none">
              Tokens
            </span>
            <span className="text-[9px] text-text-secondary uppercase tracking-widest font-mono">
              {planName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isNearLimit && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
          <span
            className={`text-xs font-mono font-bold ${
              percentage >= 90
                ? "text-rose-400"
                : percentage >= 75
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            {percentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 relative z-10">
        <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden border border-white/10 p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full transition-all ${
              percentage >= 90
                ? "bg-gradient-to-r from-rose-500 to-amber-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                : percentage >= 75
                ? "bg-gradient-to-r from-amber-400 to-emerald-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                : "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
            }`}
          />
        </div>

        {/* Quantities */}
        <div className="flex items-center justify-between text-[10px] font-mono text-text-secondary">
          <span>{usedTokens.toLocaleString()} used</span>
          <span>{remainingTokens.toLocaleString()} left</span>
        </div>
      </div>

      {/* Approaching Limit Warning Banner */}
      {isNearLimit && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-2 text-[11px] text-amber-200 relative z-10">
          <div className="flex items-center gap-1.5 font-medium">
            <AlertTriangle size={13} className="text-amber-400 shrink-0" />
            <span>{isExceeded ? "1,000,000 limit reached" : "Approaching 1M limit"}</span>
          </div>
          <button
            type="button"
            onClick={onOpenUpgrade}
            className="text-[10px] font-bold uppercase tracking-wider text-amber-300 hover:text-white underline underline-offset-2 flex items-center"
          >
            Upgrade <ArrowUpRight size={11} className="inline ml-0.5" />
          </button>
        </div>
      )}

      {/* Upgrade to Pro Action Button */}
      <div className="pt-1 flex items-center justify-between gap-2 relative z-10">
        <button
          type="button"
          onClick={onOpenUpgrade}
          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all group-hover:shadow-[0_0_15px_rgba(52,211,153,0.2)]"
        >
          <Crown size={12} className="text-emerald-400" />
          <span>Upgrade to Pro</span>
          <Sparkles size={11} className="text-emerald-400" />
        </button>

        {/* Quick Simulator Tooltips / Controls for easy verification */}
        {onSimulateTokens && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSimulateTokens(850000)}
              title="Simulate approaching limit (850k tokens)"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-amber-300 text-[9px] font-mono border border-white/5 transition-all"
            >
              85%
            </button>
            <button
              type="button"
              onClick={() => onSimulateTokens(980000)}
              title="Simulate near-cap limit (980k tokens)"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-rose-400 text-[9px] font-mono border border-white/5 transition-all"
            >
              98%
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
