import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Globe, 
  Activity, Database, Server, BarChart3, Download, Share2, Check, LayoutDashboard
} from "lucide-react";
import ArchitectureDiagram from "../components/ArchitectureDiagram";
import ThemeToggle from "../components/ThemeToggle";

const MetricCard = ({ icon: Icon, label, value, status }: { icon: any, label: string, value: string, status: "optimal" | "warning" | "critical" }) => (
  <div className="glass p-6 rounded-[2rem] border-white/5">
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
        <Icon size={18} className="text-white" />
      </div>
      <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border
        ${status === "optimal" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : 
          status === "warning" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : 
          "bg-red-500/10 border-red-500/20 text-red-400"}`}>
        {status}
      </div>
    </div>
    <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">{label}</div>
    <div className="text-2xl font-display font-black tracking-tighter text-white uppercase italic">{value}</div>
  </div>
);

const getRelativeTimestamp = (minutesAgo: number) => {
  const d = new Date(Date.now() - minutesAgo * 60000);
  return d.toISOString().replace("T", " ").substring(0, 19);
};

export default function SystemReport() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const currentTimeStr = new Date().toISOString().replace("T", " ").substring(0, 19);

  const isAuthenticated = (() => {
    try {
      return Boolean(localStorage.getItem("nexus_user"));
    } catch {
      return false;
    }
  })();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isAuthenticated ? "/dashboard" : "/");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Aether AI - System Architecture Report",
          text: "Real-time diagnostics and neural cluster telemetry for Aether AI.",
          url: window.location.href,
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-bg selection:bg-white/10">
      {/* Navigation */}
      <nav className="h-24 border-b border-white/5 flex items-center justify-between px-6 sm:px-12 bg-bg/40 backdrop-blur-3xl sticky top-0 z-50">
        <div className="flex items-center gap-4 sm:gap-8">
          <button 
            type="button"
            onClick={handleBack} 
            className="p-3 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 group cursor-pointer"
            title={isAuthenticated ? "Back to Dashboard" : "Back to Home"}
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
              Back
            </span>
          </button>
          <div>
            <h1 className="font-display font-extrabold text-lg sm:text-xl uppercase tracking-tighter">System Architecture Report</h1>
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] text-text-secondary font-bold uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Protocol v2.4.0 · Real-time Diagnostics
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle showLabel />
          
          {isAuthenticated ? (
            <Link 
              to="/dashboard"
              className="btn-secondary py-2.5 px-3.5 sm:px-4 text-[10px] uppercase tracking-widest flex items-center gap-2 text-white hover:text-cyan-300"
              title="Return to Workspace"
            >
              <LayoutDashboard size={13} className="text-cyan-400" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          ) : (
            <Link 
              to="/login"
              className="btn-primary py-2.5 px-4 text-[10px] uppercase tracking-widest flex items-center gap-2"
              title="Sign in to Aether AI"
            >
              Sign In
            </Link>
          )}

          <button 
            type="button"
            onClick={handleShare}
            className="btn-secondary py-2.5 px-3.5 sm:px-5 text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer"
            title="Share System Report URL"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span>
          </button>
          
          <button 
            type="button"
            onClick={handleExportPDF}
            className="bg-white text-black py-2.5 px-3.5 sm:px-5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
            title="Print or Save Report as PDF"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-12 py-16">
        {/* Executive Summary */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-2">
              <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 mb-6">Executive Summary</div>
              <h2 className="font-display font-black text-6xl mb-8 tracking-tighter italic uppercase leading-none">
                Neural Infrastructure <br />
                <span className="text-white/20">Status: Operational</span>
              </h2>
              <p className="text-xl text-text-secondary font-light leading-relaxed max-w-2xl">
                The Aether Intelligence Core is currently operating at peak efficiency. 
                All neural synchronization protocols are active, with a 99.98% uptime 
                across distributed processing nodes. Security vault encryption remains 
                uncompromised.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass p-8 rounded-[2.5rem] border-white/5 text-center">
                <div className="text-4xl font-display font-black text-white mb-2 tracking-tighter italic">99.9%</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Uptime</div>
              </div>
              <div className="glass p-8 rounded-[2.5rem] border-white/5 text-center">
                <div className="text-4xl font-display font-black text-white mb-2 tracking-tighter italic">12ms</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Latency</div>
              </div>
              <div className="glass p-8 rounded-[2.5rem] border-white/5 text-center">
                <div className="text-4xl font-display font-black text-white mb-2 tracking-tighter italic">4.2TB</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Throughput</div>
              </div>
              <div className="glass p-8 rounded-[2.5rem] border-white/5 text-center">
                <div className="text-4xl font-display font-black text-white mb-2 tracking-tighter italic">0</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Breaches</div>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture Visualization */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 mb-2">Technical Visualization</div>
              <h3 className="font-display font-black text-4xl tracking-tighter italic uppercase">Architecture Topology</h3>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                <div className="w-2 h-2 rounded-full bg-white" /> Active Pulse
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                <div className="w-2 h-2 rounded-full bg-white/10" /> Static Link
              </div>
            </div>
          </div>
          
          <ArchitectureDiagram />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
            <div className="p-6 border-l border-white/10">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white mb-3">Neural Interface</div>
              <p className="text-xs text-text-secondary leading-relaxed">High-performance React layer with Tailwind CSS for atomic utility styling and Framer Motion for fluid transitions.</p>
            </div>
            <div className="p-6 border-l border-white/10">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white mb-3">Aether Core</div>
              <p className="text-xs text-text-secondary leading-relaxed">Central orchestration engine managing session state, prompt engineering, and context window optimization.</p>
            </div>
            <div className="p-6 border-l border-white/10">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white mb-3">Neural Engine</div>
              <p className="text-xs text-text-secondary leading-relaxed">Gemini 3.1 Pro integration providing high-reasoning capabilities, multimodal synthesis, and rapid inference.</p>
            </div>
            <div className="p-6 border-l border-white/10">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white mb-3">Security Vault</div>
              <p className="text-xs text-text-secondary leading-relaxed">Protocol-level encryption layer ensuring data isolation and secure neural synchronization across all nodes.</p>
            </div>
          </div>
        </section>

        {/* System Health Metrics */}
        <section className="mb-24">
          <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 mb-12">System Diagnostics</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard icon={Activity} label="Neural Load" value="24.8%" status="optimal" />
            <MetricCard icon={Database} label="Memory Buffer" value="1.2 GB" status="optimal" />
            <MetricCard icon={Server} label="Node Clusters" value="12 Active" status="optimal" />
            <MetricCard icon={BarChart3} label="Inference Speed" value="840 t/s" status="optimal" />
          </div>
        </section>

        {/* Detailed Logs */}
        <section>
          <div className="glass rounded-[3rem] border-white/5 overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white">Neural Protocol Logs</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Last 24 Hours</div>
            </div>
            <div className="p-8 font-mono text-[10px] text-text-secondary space-y-4 max-h-96 overflow-y-auto">
              <div className="flex gap-6">
                <span className="text-emerald-500">[SUCCESS]</span>
                <span className="text-white/20">{getRelativeTimestamp(1)}</span>
                <span>Neural synchronization established with Node-Alpha-01</span>
              </div>
              <div className="flex gap-6">
                <span className="text-emerald-500">[SUCCESS]</span>
                <span className="text-white/20">{getRelativeTimestamp(4)}</span>
                <span>Gemini 3.1 Pro engine handshake completed (Latency: 14ms)</span>
              </div>
              <div className="flex gap-6">
                <span className="text-amber-500">[WARNING]</span>
                <span className="text-white/20">{getRelativeTimestamp(18)}</span>
                <span>Memory buffer threshold reached 70% - Initiating garbage collection</span>
              </div>
              <div className="flex gap-6">
                <span className="text-emerald-500">[SUCCESS]</span>
                <span className="text-white/20">{getRelativeTimestamp(29)}</span>
                <span>Security vault re-encryption cycle completed successfully</span>
              </div>
              <div className="flex gap-6">
                <span className="text-emerald-500">[SUCCESS]</span>
                <span className="text-white/20">{getRelativeTimestamp(45)}</span>
                <span>Neural Interface assets optimized and cached (Vite Build)</span>
              </div>
              <div className="flex gap-6">
                <span className="text-emerald-500">[SUCCESS]</span>
                <span className="text-white/20">{getRelativeTimestamp(62)}</span>
                <span>Active neural session synchronized across distributed clusters</span>
              </div>
              {/* Additional dynamic telemetry logs */}
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex gap-6">
                  <span className="text-emerald-500">[SUCCESS]</span>
                  <span className="text-white/20">{getRelativeTimestamp(75 + i * 15)}</span>
                  <span>Neural pulse synchronized across distributed cluster {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <Globe className="text-black" size={16} />
            </div>
            <span className="font-display font-black text-lg tracking-tighter uppercase italic">Aether System Report</span>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
            Generated at {currentTimeStr} · Confidential Neural Data
          </div>
        </div>
      </footer>
    </div>
  );
}
