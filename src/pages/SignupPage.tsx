import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Command, Shield, Zap, Cpu } from "lucide-react";
import { motion } from "motion/react";
import ThemeToggle from "../components/ThemeToggle";

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate neural registration
    await new Promise((r) => setTimeout(r, 2000));
    
    // In a real app, we'd call an API. Here we just simulate success.
    const newUser = { email, name, password };
    let existingUsers: any[] = [];
    try {
      existingUsers = JSON.parse(localStorage.getItem("aether_users") || "[]");
      if (!Array.isArray(existingUsers)) existingUsers = [];
    } catch {
      existingUsers = [];
    }
    localStorage.setItem("aether_users", JSON.stringify([...existingUsers, newUser]));
    localStorage.setItem("nexus_user", JSON.stringify({ email, name }));
    
    setLoading(false);
    setSuccess(true);
    
    setTimeout(() => {
      navigate("/login");
    }, 3000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass p-12 rounded-[3rem] text-center border-white/10"
        >
          <div className="w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(255,255,255,0.4)]">
            <Command className="text-black" size={32} />
          </div>
          <h2 className="font-display font-extrabold text-4xl mb-6 tracking-tighter">Neural Link Established</h2>
          <p className="text-text-secondary mb-8 font-light">Your identity has been synchronized. Redirecting to authentication core...</p>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-6">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3 }}
              className="h-full bg-white"
            />
          </div>
          <button 
            type="button"
            onClick={() => navigate("/login")}
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors"
          >
            Proceed to Login &rarr;
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-bg overflow-hidden">
      <div className="hidden lg:flex flex-col justify-center p-24 relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
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
            Request <br />
            <span className="text-white/30">Access</span>
          </h2>
          
          <p className="text-text-secondary text-xl max-w-sm mb-16 leading-relaxed font-light">
            Join the exclusive circle of neural architects and logic designers.
          </p>

          <div className="space-y-8">
            {[
              { icon: <Shield size={16} />, text: "Encrypted Neural Identity" },
              { icon: <Zap size={16} />, text: "Priority Core Access" },
              { icon: <Cpu size={16} />, text: "Advanced Logic Modules" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-6">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  {f.icon}
                </div>
                <span className="text-text-secondary text-[10px] font-bold uppercase tracking-widest">{f.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-center p-8 md:p-24 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="flex items-center justify-between mb-16">
            <Link to="/login" className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary hover:text-white transition-colors">
              <ArrowLeft size={14} /> Back to Authentication
            </Link>
            <ThemeToggle showLabel />
          </div>

          <h1 className="font-display font-extrabold text-5xl mb-4 tracking-tighter">Request Access</h1>
          <p className="text-text-secondary mb-12 font-light">Initialize your neural profile to proceed.</p>

          <form onSubmit={handleSignup} className="space-y-8">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mb-4">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Neural Architect Name"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mb-4">Identifier (Email)</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="identifier@aether.ai"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mb-4">Security Key (Password)</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-5 text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Synchronizing...
                </>
              ) : "Request Access →"}
            </button>
          </form>

          <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mt-12">
            Already have access? <Link to="/login" className="text-white hover:underline">Authenticate →</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
