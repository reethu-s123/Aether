import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, Image as ImageIcon, MessageSquare, Shield, Cpu, Box, Activity, Command, 
  Menu, X, Sparkles, Network, BarChart3, Lock, ChevronRight 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ArchitectureDiagram from "../components/ArchitectureDiagram";
import ThemeToggle from "../components/ThemeToggle";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Close mobile navigation drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent background scrolling while the mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navItems = [
    {
      id: "intelligence",
      label: "Intelligence",
      badge: "Core AI",
      desc: "Cognitive dialogue, visual engine & logic synthesis modules",
      icon: <Sparkles className="text-cyan-400" size={20} />,
      type: "anchor",
      href: "#intelligence",
    },
    {
      id: "architecture",
      label: "Architecture",
      badge: "Protocols",
      desc: "Interactive distributed network & system pipeline graph",
      icon: <Network className="text-emerald-400" size={20} />,
      type: "anchor",
      href: "#architecture-diagram",
    },
    {
      id: "report",
      label: "System Report",
      badge: "Live Telemetry",
      desc: "Real-time cluster diagnostics, node latency & PDF export",
      icon: <BarChart3 className="text-amber-400" size={20} />,
      type: "link",
      href: "/report",
    },
    {
      id: "access",
      label: "Access",
      badge: "Authentication",
      desc: "Initialize credentials, neural vault & synchronization",
      icon: <Lock className="text-purple-400" size={20} />,
      type: "anchor",
      href: "#access",
    },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    setMobileMenuOpen(false);
    if (item.type === "anchor") {
      const targetId = item.href.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const features = [
    { icon: <MessageSquare className="text-white" />, title: "Neural Dialogue", desc: "Deeply context-aware conversations powered by Aether's core intelligence." },
    { icon: <Cpu className="text-white" />, title: "Logic Synthesis", desc: "Deconstruct complex documents and codebases with surgical precision." },
    { icon: <ImageIcon className="text-white" />, title: "Visual Core", desc: "Transform ethereal concepts into high-fidelity visual masterpieces." },
    { icon: <Activity className="text-white" />, title: "Zero Latency", desc: "A distributed neural architecture designed for the speed of thought." },
    { icon: <Shield className="text-white" />, title: "Isolated Vault", desc: "Your data remains yours. Encrypted, isolated, and never shared." },
    { icon: <Box className="text-white" />, title: "Architect Engine", desc: "An expert companion for debugging, refactoring, and neural design." },
  ];

  return (
    <div className="relative min-h-screen bg-bg selection:bg-white/10 overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-white/[0.02] blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-white/[0.02] blur-[160px] rounded-full animate-pulse [animation-delay:2s]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-24 bg-bg/40 backdrop-blur-3xl border-b border-white/5 flex items-center px-6 sm:px-12 md:px-24 justify-between">
        <div className="flex items-center gap-4 sm:gap-5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.4)] group-hover:scale-110 transition-transform duration-500">
            <Command className="text-black" size={22} />
          </div>
          <span className="font-display font-black text-2xl sm:text-3xl tracking-tighter uppercase text-white italic">
            Aether
          </span>
        </div>
        
        {/* Desktop / Tablet Navigation (Visible from md up, fixing deployed view) */}
        <div className="hidden md:flex items-center gap-8 lg:gap-14 xl:gap-16 text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.25em] text-text-secondary">
          <a href="#intelligence" className="hover:text-white transition-colors relative group py-2">
            Intelligence
            <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all group-hover:w-full" />
          </a>
          <a href="#architecture-diagram" className="hover:text-white transition-colors relative group py-2">
            Architecture
            <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all group-hover:w-full" />
          </a>
          <Link to="/report" className="hover:text-white transition-colors relative group py-2">
            System Report
            <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all group-hover:w-full" />
          </Link>
          <a href="#access" className="hover:text-white transition-colors relative group py-2">
            Access
            <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all group-hover:w-full" />
          </a>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <ThemeToggle showLabel />
          <Link to="/login" className="hidden sm:inline-flex btn-primary py-3.5 sm:py-4 px-6 sm:px-10 text-[10px] uppercase tracking-[0.2em]">
            Initialize Access
          </Link>

          {/* Mobile Navigation Toggle (Shown on mobile devices where points are hidden) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={18} className="text-white" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile Application Navigation Menu (Intelligence, Architecture, System Report, Access) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end sm:justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-xl"
            />

            {/* Modal Sheet Content */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.96 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="relative z-10 w-full max-w-lg mx-auto bg-surface/95 border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-[0_0_80px_rgba(0,0,0,0.8)] max-h-[92vh] overflow-y-auto"
            >
              {/* Header with Title and the prominent WRONG SIGN (Close X Button) */}
              <div className="flex items-center justify-between pb-5 mb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 text-white shadow-inner">
                    <Command size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">Aether Navigation</h3>
                    <p className="text-[10px] text-text-secondary font-mono tracking-wider">Protocol Core v2.5</p>
                  </div>
                </div>

                {/* THE WRONG SIGN (Close X button) */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/25 hover:text-rose-100 transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
                  title="Close menu (wrong sign)"
                  aria-label="Close navigation menu"
                >
                  <X size={18} className="stroke-[2.5]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Close</span>
                </button>
              </div>

              {/* The 4 Points: Intelligence, Architecture, System Report, Access */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between px-1 mb-1">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-text-secondary font-bold">
                    Navigation Protocols
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    ● Synchronized
                  </span>
                </div>

                {navItems.map((item) => {
                  const itemContent = (
                    <div className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all flex items-center gap-4 group cursor-pointer active:scale-[0.98]">
                      <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-white/10 transition-all">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display font-bold text-sm tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                            {item.label}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-mono tracking-wider text-text-secondary border border-white/5">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary leading-snug line-clamp-1">
                          {item.desc}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-text-secondary group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  );

                  if (item.type === "link") {
                    return (
                      <Link 
                        key={item.id} 
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block focus:outline-none"
                      >
                        {itemContent}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item)}
                      className="w-full block focus:outline-none text-left"
                    >
                      {itemContent}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Quick Actions */}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full py-4 text-center text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  <span>Initialize Access</span>
                  <ArrowRight size={14} />
                </Link>

                {/* Wrong Sign Secondary Close Option */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-[10px] uppercase tracking-widest text-text-secondary hover:text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <X size={13} className="text-rose-400" />
                  <span>Dismiss / Close</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative z-10 pt-64 pb-48 px-8 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="inline-flex items-center gap-4 px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-bold tracking-[0.3em] uppercase mb-16"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
          Neural Core v2.5 Synchronized
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-display font-extrabold text-7xl md:text-[12rem] leading-[0.8] tracking-tighter mb-16 max-w-7xl"
        >
          Neural <br />
          <span className="text-white/20">Synthesis</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-text-secondary text-xl md:text-3xl max-w-4xl mb-24 leading-relaxed font-light"
        >
          Aether is a high-fidelity workspace designed to augment human thought. 
          Experience intelligence that feels like a natural extension of your neural pathways.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-8"
        >
          <Link to="/login" className="btn-primary text-[10px] px-16 py-6 flex items-center gap-5 uppercase tracking-[0.3em]">
            Begin Journey <ArrowRight size={16} />
          </Link>
          <a href="#architecture-diagram" className="btn-secondary text-[10px] px-16 py-6 flex items-center gap-5 uppercase tracking-[0.3em]">
            Neural Protocols
          </a>
        </motion.div>

        {/* Mockup Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="mt-48 relative w-full max-w-7xl mx-auto px-4"
        >
          <div className="absolute -inset-40 bg-white/5 blur-[160px] rounded-full opacity-20 pointer-events-none" />
          <div className="relative glass rounded-[4rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.6)] border-white/5 group">
            <div className="h-20 bg-white/5 border-b border-white/5 flex items-center px-12 gap-4">
              <div className="flex gap-3">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
              </div>
              <div className="mx-auto bg-white/5 rounded-full px-8 py-2 text-[10px] text-text-secondary font-mono tracking-[0.3em] uppercase border border-white/5">
                aether.neural.core.01
              </div>
            </div>
            <div className="aspect-[21/9] bg-surface relative overflow-hidden">
              <img 
                src="https://picsum.photos/seed/aether-vision/2560/1440?grayscale" 
                alt="Aether Interface" 
                className="w-full h-full object-cover opacity-30 mix-blend-luminosity transition-all duration-[2s] group-hover:scale-110 group-hover:opacity-50"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-[2.5rem] bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center animate-float shadow-[0_0_60px_rgba(255,255,255,0.2)]">
                  <Command className="text-white" size={48} />
                </div>
              </div>
              
              {/* Floating UI Elements */}
              <div className="absolute bottom-12 left-12 p-8 glass rounded-[2rem] border-white/10 max-w-xs hidden md:block">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <div className="text-[10px] font-bold uppercase tracking-widest">Neural Link Active</div>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="h-full bg-white" 
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Architecture Diagram Section */}
      <section id="architecture-diagram" className="py-32 px-8 relative z-10 scroll-mt-24">
        <span id="architecture" className="relative -top-28 block invisible" />
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="font-display font-extrabold text-5xl md:text-7xl mb-6 tracking-tighter uppercase">Neural <span className="text-white/20">Architecture</span></h2>
          <p className="text-text-secondary text-xl font-light max-w-2xl mx-auto uppercase tracking-widest">A distributed intelligence network designed for absolute synchronization.</p>
        </div>
        <ArchitectureDiagram />
      </section>

      {/* Features Grid (Intelligence Core) */}
      <section id="intelligence" className="py-32 md:py-64 px-8 relative z-10 bg-bg scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-12">
            <div className="max-w-3xl">
              <h2 className="font-display font-extrabold text-6xl md:text-9xl mb-10 tracking-tighter">Neural <br /> <span className="text-white/20">Capabilities</span></h2>
              <p className="text-text-secondary text-2xl font-light leading-relaxed">Engineered for those who demand absolute precision. Aether provides a suite of advanced neural modules for the modern architect.</p>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-8xl font-display font-extrabold text-white/5 mb-4">01</div>
              <button 
                onClick={() => document.getElementById('architecture-diagram')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                Core Architecture
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -15 }}
                className="glass glass-hover p-16 rounded-[3.5rem] border-white/5 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] blur-3xl rounded-full group-hover:bg-white/[0.05] transition-colors" />
                <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mb-12 border border-white/10 shadow-2xl group-hover:bg-white group-hover:text-black transition-all duration-500">
                  <div className="group-hover:scale-110 transition-transform duration-500">
                    {f.icon}
                  </div>
                </div>
                <h3 className="font-display font-bold text-3xl mb-6 tracking-tight">{f.title}</h3>
                <p className="text-text-secondary text-lg leading-relaxed font-light">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="access" className="py-32 md:py-64 px-8 relative z-10 scroll-mt-24">
        <div className="max-w-7xl mx-auto glass rounded-[5rem] p-20 md:p-40 text-center relative overflow-hidden border-white/5 shadow-[0_0_100px_rgba(255,255,255,0.02)]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.03] blur-[160px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/[0.03] blur-[160px] rounded-full" />
          
          <h2 className="font-display font-extrabold text-6xl md:text-[10rem] mb-16 relative z-10 tracking-tighter leading-[0.85]">Join the <br /> <span className="text-white/20">Neural Era</span></h2>
          <p className="text-text-secondary text-2xl mb-24 max-w-3xl mx-auto relative z-10 font-light leading-relaxed">Aether is currently in exclusive synchronization. Secure your position in the future of neural workspaces.</p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center relative z-10">
            <Link to="/login" className="btn-primary px-20 py-7 text-[10px] uppercase tracking-[0.3em]">Request Access</Link>
            <Link to="/login" className="btn-secondary px-20 py-7 text-[10px] uppercase tracking-[0.3em]">Core Documentation</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-48 px-12 md:px-24 border-t border-white/5 relative z-10 bg-bg">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-32">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-5 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                <Command className="text-black" size={24} />
              </div>
              <span className="font-display font-extrabold text-3xl tracking-tighter uppercase text-white">
                Aether
              </span>
            </div>
            <p className="text-text-secondary text-base leading-relaxed font-light">
              Synthesizing human creativity with neural intelligence. A product of the future, available today.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-[10px] uppercase tracking-[0.4em] text-white mb-12">Intelligence</h4>
            <ul className="space-y-8 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
              <li><a href="#" className="hover:text-white transition-colors">Neural Chat</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Visual Engine</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Logic Core</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-[10px] uppercase tracking-[0.4em] text-white mb-12">Ecosystem</h4>
            <ul className="space-y-8 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
              <li><a href="#architecture" className="hover:text-white transition-colors">Architecture</a></li>
              <li><Link to="/report" className="hover:text-white transition-colors">System Report</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Neural Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-[10px] uppercase tracking-[0.4em] text-white mb-12">Protocols</h4>
            <ul className="space-y-8 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-48 pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">
          <p>© {new Date().getFullYear()} Aether Intelligence. All protocols observed.</p>
          <div className="flex gap-16">
            <a href="#" className="hover:text-white transition-colors">X / Twitter</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
