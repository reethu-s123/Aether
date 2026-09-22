import { motion } from 'motion/react';
import { Cpu, Zap, Shield, Globe, Command } from 'lucide-react';

const Node = ({ icon: Icon, label, sublabel, position }: { icon: any, label: string, sublabel: string, position: string }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className={`absolute ${position} flex flex-col items-center gap-4 z-10`}
  >
    <div className="w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] border border-white/10 group hover:scale-110 transition-transform duration-500">
      <Icon className="text-black" size={32} />
    </div>
    <div className="text-center">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-1">{label}</div>
      <div className="text-[10px] text-text-secondary uppercase tracking-widest">{sublabel}</div>
    </div>
  </motion.div>
);

const Connection = ({ start, end, delay = 0 }: { start: string, end: string, delay?: number }) => (
  <svg 
    viewBox="0 0 100 100" 
    preserveAspectRatio="none"
    className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
  >
    <motion.path
      d={`M ${start} L ${end}`}
      stroke="rgba(255,255,255,0.08)"
      strokeWidth="1"
      vectorEffect="non-scaling-stroke"
      fill="none"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, delay }}
    />
    <motion.circle
      r="2"
      fill="white"
      initial={{ offsetDistance: "0%" }}
      animate={{ offsetDistance: "100%" }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear", delay }}
      style={{ offsetPath: `path('M ${start} L ${end}')` }}
    />
  </svg>
);

export default function ArchitectureDiagram() {
  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-[16/9] bg-surface/30 rounded-[4rem] border border-white/5 overflow-hidden p-20">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Central Core */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-[3rem] bg-white/5 border border-white/10 flex items-center justify-center z-0"
      >
        <div className="absolute inset-0 bg-white/5 blur-[100px] rounded-full animate-pulse" />
        <div className="relative w-24 h-24 rounded-[2rem] bg-white flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.3)]">
          <Command className="text-black" size={40} />
        </div>
      </motion.div>

      {/* Nodes */}
      <Node 
        icon={Globe} 
        label="Neural Interface" 
        sublabel="React / Tailwind" 
        position="top-0 left-1/2 -translate-x-1/2" 
      />
      <Node 
        icon={Shield} 
        label="Security Vault" 
        sublabel="Encrypted Layer" 
        position="bottom-0 left-1/2 -translate-x-1/2" 
      />
      <Node 
        icon={Cpu} 
        label="Aether Core" 
        sublabel="Context Engine" 
        position="top-1/2 left-0 -translate-y-1/2" 
      />
      <Node 
        icon={Zap} 
        label="Neural Engine" 
        sublabel="Gemini 3.1 Pro" 
        position="top-1/2 right-0 -translate-y-1/2" 
      />

      {/* Connections (Coordinates relative to 100x100 viewBox) */}
      {/* Interface to Core */}
      <Connection start="50 15" end="50 50" delay={0.2} />
      {/* Security to Core */}
      <Connection start="50 85" end="50 50" delay={0.4} />
      {/* Processing to Core */}
      <Connection start="15 50" end="50 50" delay={0.6} />
      {/* Engine to Core */}
      <Connection start="85 50" end="50 50" delay={0.8} />

      {/* Labels */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-32 text-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Neural Synchronization Hub</div>
      </div>
    </div>
  );
}
