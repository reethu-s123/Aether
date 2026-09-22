import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Command, User, FileText, Image as ImageIcon, ThumbsUp, ThumbsDown, Volume2, Loader2 } from "lucide-react";
import { Message } from "../lib/types";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter',
});

const Mermaid = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    if (ref.current && chart) {
      setRenderError(false);
      const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
      mermaid.render(id, chart).then(({ svg }) => {
        if (ref.current) ref.current.innerHTML = svg;
      }).catch(err => {
        console.warn("Mermaid diagram rendering issue:", err);
        setRenderError(true);
      });
    }
  }, [chart]);

  if (renderError) {
    return (
      <div className="my-4 p-4 rounded-2xl bg-white/5 border border-white/10 font-mono text-xs text-text-secondary overflow-x-auto whitespace-pre">
        {chart}
      </div>
    );
  }

  return <div ref={ref} className="my-6 flex justify-center bg-white/5 p-6 rounded-2xl border border-white/10 overflow-x-auto" />;
};

interface Props { 
  message: Message; 
  onFeedback?: (id: string, type: "like" | "dislike") => void;
  onSpeak?: (text: string) => Promise<void>;
}

export default function ChatMessage({ message, onFeedback, onSpeak }: Props) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = async () => {
    if (!onSpeak || speaking) return;
    setSpeaking(true);
    try {
      await onSpeak(message.content);
    } finally {
      setSpeaking(false);
    }
  };

  const isUser = message.role === "user";

  return (
    <div className={`flex gap-6 group ${isUser ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-6 duration-700`}>
      {/* Avatar */}
      <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:scale-110
        ${isUser 
          ? "bg-white/5 border border-white/10" 
          : "bg-white shadow-[0_0_30px_rgba(255,255,255,0.1)]"
        }`}>
        {isUser ? <User size={18} className="text-text-secondary" /> : <Command size={18} className="text-black" />}
      </div>

      <div className={`flex flex-col max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Attachments preview */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3">
            {message.attachments.map((att, i) => (
              <div key={`${att.name}-${i}`} className="flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-text-secondary hover:text-white transition-colors cursor-default">
                {att.type.startsWith("image/") ? <ImageIcon size={12} /> : <FileText size={12} />}
                <span className="max-w-[120px] truncate">{att.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Message bubble */}
        <div className={`px-7 py-6 rounded-[2.5rem] text-base leading-relaxed font-light
          ${isUser 
            ? "bg-white/5 border border-white/10 text-white rounded-tr-none" 
            : "bg-surface border border-white/5 text-text-primary rounded-tl-none shadow-2xl"
          }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    if (!inline && match && match[1] === "mermaid") {
                      return <Mermaid chart={String(children).replace(/\n$/, "")} />;
                    }
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Generated images */}
        {message.images && message.images.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-6">
            {message.images.map((img, i) => (
              <div key={`${img.url}-${i}`} className="rounded-[2.5rem] overflow-hidden border border-white/5 bg-surface group/img relative shadow-2xl">
                <img 
                  src={img.url} 
                  alt={img.prompt} 
                  className="w-80 h-80 object-cover transition-transform duration-1000 group-hover/img:scale-110" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-[0.2em] line-clamp-2">
                    Visual Synthesis: {img.prompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions & Timestamp */}
        <div className="flex items-center gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.3em]">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {!isUser && (
            <>
              <button 
                onClick={copy} 
                className="p-2 rounded-xl hover:bg-white/5 text-text-secondary hover:text-white transition-all"
                title="Copy Neural Data"
              >
                {copied ? <Check size={14} className="text-white" /> : <Copy size={14} />}
              </button>
              <button 
                onClick={handleSpeak}
                disabled={speaking}
                className={`p-2 rounded-xl hover:bg-white/5 transition-all
                  ${speaking ? "text-white animate-pulse" : "text-text-secondary hover:text-white"}`}
                title="Synthesize Speech"
              >
                {speaking ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
              </button>
              <div className="w-px h-4 bg-white/5 mx-1" />
              <button 
                onClick={() => onFeedback?.(message.id, "like")}
                className={`p-2 rounded-xl hover:bg-white/5 transition-all
                  ${message.feedback === "like" ? "text-white bg-white/10" : "text-text-secondary hover:text-white"}`}
                title="Neural Resonance"
              >
                <ThumbsUp size={14} />
              </button>
              <button 
                onClick={() => onFeedback?.(message.id, "dislike")}
                className={`p-2 rounded-xl hover:bg-white/5 transition-all
                  ${message.feedback === "dislike" ? "text-white bg-white/10" : "text-text-secondary hover:text-white"}`}
                title="Neural Dissonance"
              >
                <ThumbsDown size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
