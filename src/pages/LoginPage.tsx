import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Github, Chrome, Command } from "lucide-react";
import { motion } from "motion/react";
import ThemeToggle from "../components/ThemeToggle";

const USERS = [
  { email: "admin@aether.ai", password: "aether@2025", name: "Admin" },
  { email: "demo@aether.ai",  password: "demo1234",   name: "Demo User" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) { setError("Identification required."); return; }
    if (!password)     { setError("Authentication key required."); return; }

    setLoading(true);
    setError("");
    
    await new Promise((r) => setTimeout(r, 1500));

    let localUsers = [];
    try {
      localUsers = JSON.parse(localStorage.getItem("aether_users") || "[]");
    } catch {
      localUsers = [];
    }
    const allUsers = [...USERS, ...(Array.isArray(localUsers) ? localUsers : [])];

    const user = allUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );

    if (user) {
      localStorage.setItem("nexus_user", JSON.stringify({ email: user.email, name: user.name }));
      navigate("/dashboard");
    } else {
      setError("Access denied. Invalid neural signature.");
      setPassword("");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-bg overflow-hidden">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex flex-col justify-center p-24 relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10"
        >
          <Link to="/" className="flex items-center gap-4 mb-24 no-underline group">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)] group-hover:scale-110 transition-transform duration-500">
              <Command className="text-black" size={24} />
            </div>
            <span className="font-display font-black text-3xl tracking-tighter uppercase text-white italic">
              Aether
            </span>
          </Link>

          <h2 className="font-display font-extrabold text-7xl leading-[0.85] tracking-tighter mb-10 max-w-md">
            Neural <br />
            <span className="text-white/30">Authentication</span>
          </h2>
          
          <p className="text-text-secondary text-xl max-w-sm mb-16 leading-relaxed font-light">
            Verify your identity to access the Aether intelligence core.
          </p>

          <div className="space-y-8">
            {[
              { text: "Synchronize neural conversations" },
              { text: "Access high-fidelity visual synthesis" },
              { text: "Initialize logic core modules" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-6">
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
                <span className="text-text-secondary text-xs font-bold uppercase tracking-widest">{f.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex items-center justify-center p-8 md:p-24 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="flex items-center justify-between mb-16">
            <Link to="/" className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary hover:text-white transition-colors">
              <ArrowLeft size={14} /> Back to Origin
            </Link>
            <ThemeToggle showLabel />
          </div>

          <h1 className="font-display font-extrabold text-5xl mb-4 tracking-tighter">Initialize Access</h1>
          <p className="text-text-secondary mb-12 font-light">Enter your neural credentials to proceed.</p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest mb-8 flex items-center gap-4"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-8">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mb-4">Neural Identifier</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="input-field"
                placeholder="identifier@aether.ai"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Access Key</label>
                <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">Lost Key?</a>
              </div>
              <div className="relative">
                <input 
                  type={showPw ? "text" : "password"} 
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="input-field pr-16"
                  placeholder="••••••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-5 text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Verifying...
                </>
              ) : "Initialize Access →"}
            </button>
          </form>

          <div className="relative my-16">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
              <span className="bg-bg px-6 text-text-secondary font-bold">External Protocols</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-12">
            <button 
              type="button"
              onClick={() => {
                localStorage.setItem("nexus_user", JSON.stringify({ email: "operator@google.com", name: "Google Operator" }));
                navigate("/dashboard");
              }}
              className="btn-secondary py-4 flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest cursor-pointer"
            >
              <Chrome size={18} /> Google
            </button>
            <button 
              type="button"
              onClick={() => {
                localStorage.setItem("nexus_user", JSON.stringify({ email: "developer@github.com", name: "GitHub Developer" }));
                navigate("/dashboard");
              }}
              className="btn-secondary py-4 flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest cursor-pointer"
            >
              <Github size={18} /> GitHub
            </button>
          </div>

          <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
            New to Aether? <Link to="/signup" className="text-white hover:underline">Request Access →</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
