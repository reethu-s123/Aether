import { motion, AnimatePresence } from "motion/react";
import { X, Crown, Check, Zap, Sparkles, Shield, ArrowRight, AlertTriangle, RefreshCw } from "lucide-react";
import { useState } from "react";

interface UpgradeToProModalProps {
  isOpen: boolean;
  onClose: () => void;
  usedTokens: number;
  totalLimit: number;
  onUpgrade: () => void;
  onReset?: () => void;
}

export default function UpgradeToProModal({
  isOpen,
  onClose,
  usedTokens,
  totalLimit,
  onUpgrade,
  onReset,
}: UpgradeToProModalProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradedSuccess, setUpgradedSuccess] = useState(false);

  const percentage = Math.min(100, Math.round((usedTokens / totalLimit) * 100));
  const isNearLimit = usedTokens >= 800000;
  const isExceeded = usedTokens >= totalLimit;

  const handleConfirmUpgrade = () => {
    setIsUpgrading(true);
    setTimeout(() => {
      onUpgrade();
      setIsUpgrading(false);
      setUpgradedSuccess(true);
      setTimeout(() => {
        setUpgradedSuccess(false);
        onClose();
      }, 1400);
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-2xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Ambient Backlight */}
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/15 blur-[90px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/15 blur-[90px] pointer-events-none" />

            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02] relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-black shadow-[0_0_25px_rgba(52,211,153,0.4)]">
                  <Crown size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-black text-xl uppercase tracking-tight text-white">
                      Upgrade to Aether Pro
                    </h2>
                    {isNearLimit && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {isExceeded ? "Limit Reached" : "Near 1M Limit"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Uncap your intelligence throughput with expanded token capacity.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl hover:bg-white/5 text-text-secondary hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar relative z-10">
              {/* Token Consumption Progress Indicator */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-text-secondary text-[11px]">
                    <Zap size={14} className={isNearLimit ? "text-amber-400" : "text-emerald-400"} />
                    <span>Free Tier Token Consumption</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-white">
                    {percentage}% Used
                  </span>
                </div>

                {/* Bar */}
                <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full transition-colors ${
                      percentage >= 90
                        ? "bg-gradient-to-r from-rose-500 to-amber-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                        : percentage >= 75
                        ? "bg-gradient-to-r from-amber-400 to-emerald-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                        : "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                    }`}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-text-secondary">
                  <span>{usedTokens.toLocaleString()} tokens consumed</span>
                  <span className="text-white font-semibold">
                    Limit: {totalLimit.toLocaleString()} tokens
                  </span>
                </div>

                {isNearLimit && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs mt-2">
                    <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      {isExceeded
                        ? "You have reached the 1,000,000 free token limit. Upgrade to Pro for 10M tokens and unlimited high-speed inference."
                        : "You are approaching the 1,000,000 free token cap. Upgrade now to avoid interruption to neural sessions."}
                    </span>
                  </div>
                )}
              </div>

              {/* Billing Toggle */}
              <div className="flex items-center justify-between p-2 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-xs font-bold uppercase tracking-widest text-text-secondary pl-3">
                  Billing Period
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      billingCycle === "monthly"
                        ? "bg-white text-black shadow-lg"
                        : "text-text-secondary hover:text-white"
                    }`}
                  >
                    Monthly ($19/mo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("yearly")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      billingCycle === "yearly"
                        ? "bg-emerald-400 text-black shadow-lg shadow-emerald-500/20"
                        : "text-text-secondary hover:text-white"
                    }`}
                  >
                    Annual ($15/mo)
                    <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-[9px] font-black uppercase">
                      -20%
                    </span>
                  </button>
                </div>
              </div>

              {/* Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Starter Plan */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-1">
                      Starter Plan (Current)
                    </div>
                    <div className="font-display font-extrabold text-2xl text-white mb-3">$0</div>
                    <ul className="space-y-2 text-xs text-text-secondary">
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-400" />
                        <span>1,000,000 Free Tokens</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-400" />
                        <span>Standard Latency</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-400" />
                        <span>Basic Multimodal Input</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Pro Tier Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-500/10 via-white/[0.03] to-white/[0.03] border-2 border-emerald-500/40 shadow-[0_0_30px_rgba(52,211,153,0.15)] flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-400 text-black text-[9px] font-black uppercase tracking-wider">
                    Recommended
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1 flex items-center gap-1.5">
                      <Sparkles size={13} />
                      <span>Aether Pro Neural</span>
                    </div>
                    <div className="font-display font-extrabold text-2xl text-white mb-3">
                      {billingCycle === "monthly" ? "$19" : "$15"}
                      <span className="text-xs text-text-secondary font-normal font-sans"> /month</span>
                    </div>
                    <ul className="space-y-2 text-xs text-white">
                      <li className="flex items-center gap-2 font-semibold">
                        <Check size={14} className="text-emerald-400" />
                        <span>10,000,000 Monthly Tokens</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-400" />
                        <span>Priority Zero-Queue Response</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-400" />
                        <span>Deep Reasoning & Code Synthesis</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-400" />
                        <span>Extended 1M Context Window</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 sm:p-8 border-t border-white/5 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                <Shield size={14} className="text-emerald-400" />
                <span>Cancel anytime. 100% money-back guarantee.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {onReset && (
                  <button
                    type="button"
                    onClick={() => {
                      onReset();
                      onClose();
                    }}
                    className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white text-xs font-bold uppercase tracking-wider transition-all"
                    title="Reset consumed token counter for testing"
                  >
                    Reset Usage
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleConfirmUpgrade}
                  disabled={isUpgrading}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 text-black hover:brightness-110 text-xs font-extrabold uppercase tracking-widest shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  {upgradedSuccess ? (
                    <>
                      <Check size={16} className="text-black" />
                      <span>Upgraded to Pro!</span>
                    </>
                  ) : isUpgrading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin text-black" />
                      <span>Activating...</span>
                    </>
                  ) : (
                    <>
                      <Crown size={16} />
                      <span>Upgrade to Pro Now</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
