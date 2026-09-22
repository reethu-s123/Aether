import { motion, AnimatePresence } from "motion/react";
import { X, Command, Zap, Shield, Cpu, MessageSquare, ExternalLink, Check, Copy, Sliders, Volume2, Trash2, RotateCcw, Sparkles, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-8 sm:p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                  <Command className="text-black" size={20} />
                </div>
                <h2 className="font-display font-extrabold text-2xl uppercase tracking-tighter">{title}</h2>
              </div>
              <button onClick={onClose} className="p-3 rounded-xl hover:bg-white/5 text-text-secondary hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 sm:p-10 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function SettingsModal({
  isOpen,
  onClose,
  onClearHistory,
}: {
  isOpen: boolean;
  onClose: () => void;
  onClearHistory?: () => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const [model, setModel] = useState<string>("gemini-2.5-flash");
  const [temperature, setTemperature] = useState<number>(0.7);
  const [voice, setVoice] = useState<string>("Aoede");
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(false);
  const [streamResponses, setStreamResponses] = useState<boolean>(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [clearedSuccess, setClearedSuccess] = useState(false);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("aether_neural_settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.model) setModel(parsed.model);
        if (parsed.temperature !== undefined) setTemperature(parsed.temperature);
        if (parsed.voice) setVoice(parsed.voice);
        if (parsed.autoPlayAudio !== undefined) setAutoPlayAudio(parsed.autoPlayAudio);
        if (parsed.streamResponses !== undefined) setStreamResponses(parsed.streamResponses);
      }
    } catch (e) {
      console.error(e);
    }
  }, [isOpen]);

  const handleSave = () => {
    const settings = { model, temperature, voice, autoPlayAudio, streamResponses };
    localStorage.setItem("aether_neural_settings", JSON.stringify(settings));
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleResetDefaults = () => {
    setModel("gemini-2.5-flash");
    setTemperature(0.7);
    setVoice("Aoede");
    setAutoPlayAudio(false);
    setStreamResponses(true);
    localStorage.removeItem("aether_neural_settings");
  };

  const handleClearHistory = () => {
    if (onClearHistory) onClearHistory();
    setClearedSuccess(true);
    setTimeout(() => setClearedSuccess(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Neural Settings & Configuration">
      <div className="space-y-8">
        {/* Model Selection */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Default Intelligence Core</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", desc: "Ultra-low latency inference", tag: "Fastest" },
              { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", desc: "Deep reasoning & architecture", tag: "Pro" },
              { id: "grok-fun", name: "Grok Mode", desc: "Witty & unfiltered insights", tag: "Creative" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setModel(m.id)}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  model === m.id
                    ? "bg-white/10 border-white text-white shadow-lg"
                    : "bg-white/5 border-white/5 text-text-secondary hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">{m.name}</span>
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-white">
                    {m.tag}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary line-clamp-1">{m.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Creativity / Temperature Slider */}
        <section className="space-y-3 p-5 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-white" />
              <label className="text-xs font-bold uppercase tracking-widest text-white">Neural Temperature</label>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {temperature.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-white h-2 bg-white/10 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-text-secondary font-mono">
            <span>Precise / Deterministic (0.0)</span>
            <span>Balanced (0.7)</span>
            <span>Creative / Wild (1.0)</span>
          </div>
        </section>

        {/* Audio Narration Voice */}
        <section className="space-y-3 p-5 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 size={16} className="text-white" />
              <label className="text-xs font-bold uppercase tracking-widest text-white">Voice Synthesizer Profile</label>
            </div>
            <span className="text-xs font-mono text-text-secondary">Prebuilt Voices</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {["Aoede", "Charon", "Fenrir", "Kore", "Puck"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVoice(v)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  voice === v
                    ? "bg-white text-black font-extrabold shadow-md"
                    : "bg-white/5 text-text-secondary hover:text-white border border-white/5"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </section>

        {/* Theme and Interface Controls */}
        <section className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === "dark" ? <Moon size={18} className="text-cyan-400" /> : <Sun size={18} className="text-amber-400" />}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-white">Display Theme</div>
              <div className="text-[11px] text-text-secondary">Toggle between Aether Obsidian Dark and Pure Light Mode</div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/10 transition-all uppercase tracking-wider"
          >
            {theme === "dark" ? "Dark Mode" : "Light Mode"}
          </button>
        </section>

        {/* Memory Management */}
        <section className="p-5 rounded-2xl bg-red-500/[0.03] border border-red-500/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trash2 size={18} className="text-red-400" />
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-red-400">Clear Neural Memory</div>
              <div className="text-[11px] text-text-secondary">Erase local session chats and token usage counters</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearHistory}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-400 border border-red-500/20 transition-all uppercase tracking-wider flex items-center gap-1.5"
          >
            {clearedSuccess ? <Check size={14} className="text-emerald-400" /> : <Trash2 size={14} />}
            <span>{clearedSuccess ? "Cleared!" : "Clear Data"}</span>
          </button>
        </section>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white text-xs font-bold uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-3 rounded-xl bg-white text-black hover:bg-slate-200 text-xs font-extrabold uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              {saveSuccess ? <Check size={14} className="text-emerald-600" /> : <Sparkles size={14} />}
              <span>{saveSuccess ? "Saved!" : "Apply Changes"}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function HelpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const steps = [
    { title: "Access AI Studio", desc: "Navigate to aistudio.google.com and authenticate with your Google identity." },
    { title: "Initialize Key", desc: "Select 'Get API key' from the neural navigation sidebar." },
    { title: "Generate Protocol", desc: "Click 'Create API key in new project' to synthesize a unique access token." },
    { title: "Synchronize", desc: "Copy the generated key and integrate it into your Aether environment configuration." }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Core Documentation">
      <div className="space-y-12">
        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white mb-8">Core Protocols</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                <MessageSquare size={18} />
              </div>
              <h4 className="font-bold text-lg mb-2">Neural Chat</h4>
              <p className="text-text-secondary text-sm font-light leading-relaxed">Engage in context-aware synthesis for complex logic and creative thought.</p>
            </div>
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                <Zap size={18} />
              </div>
              <h4 className="font-bold text-lg mb-2">Visual Synthesis</h4>
              <p className="text-text-secondary text-sm font-light leading-relaxed">Transform textual concepts into high-fidelity ethereal visualizations.</p>
            </div>
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                <Cpu size={18} />
              </div>
              <h4 className="font-bold text-lg mb-2">Neural Diagrams</h4>
              <p className="text-text-secondary text-sm font-light leading-relaxed">Ask for "pipeline diagrams" or "flowcharts" to generate interactive Mermaid visualizations.</p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">Gemini API Integration</h3>
            <a href="https://aistudio.google.com" target="_blank" className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-2 transition-colors">
              AI Studio <ExternalLink size={12} />
            </a>
          </div>
          <div className="space-y-6">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-6">
                <div className="text-2xl font-display font-extrabold text-white/10 w-8 flex-shrink-0">0{i+1}</div>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-widest mb-2">{s.title}</h4>
                  <p className="text-text-secondary text-sm font-light leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield size={20} className="text-text-secondary" />
            <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Security Protocol: Active</span>
          </div>
          <button 
            onClick={() => {
              navigator.clipboard.writeText("https://aistudio.google.com");
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-[10px] font-bold uppercase tracking-widest text-white hover:underline flex items-center gap-2"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy Link"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function FeedbackModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Neural Feedback">
      {sent ? (
        <div className="py-20 text-center">
          <div className="w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Check className="text-black" size={32} />
          </div>
          <h3 className="font-display font-extrabold text-3xl mb-4 tracking-tighter">Transmission Complete</h3>
          <p className="text-text-secondary font-light">Your insights have been synchronized with the core.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-10">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.4em] text-text-secondary mb-6">Experience Rating</label>
            <div className="flex justify-between gap-4">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" className="flex-1 py-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white hover:text-black transition-all font-display font-extrabold text-2xl">
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.4em] text-text-secondary mb-6">Neural Insights</label>
            <textarea 
              required
              className="input-field min-h-[160px] resize-none py-6"
              placeholder="Describe your experience with the Aether core..."
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-6 text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4"
          >
            {loading ? "Transmitting..." : "Synchronize Feedback →"}
          </button>
        </form>
      )}
    </Modal>
  );
}
