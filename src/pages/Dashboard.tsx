import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Send, Plus, Wand2, Sparkles, FileText,
  Paperclip, MessageSquare, Settings, LogOut, Command, Cpu, Zap, BarChart3, Calendar,
  Download, X, Trash2, Menu
} from "lucide-react";
import ChatMessage from "../components/ChatMessage";
import FileUploadZone from "../components/FileUploadZone";
import { HelpModal, FeedbackModal, SettingsModal } from "../components/Modals";
import TokenUsageTracker from "../components/TokenUsageTracker";
import UpgradeToProModal from "../components/UpgradeToProModal";
import SidebarSessionList from "../components/SidebarSessionList";
import ScheduledTodoList from "../components/ScheduledTodoList";
import ScheduledTodoModal from "../components/ScheduledTodoModal";
import ExportSessionModal from "../components/ExportSessionModal";
import { ThemeToggle } from "../components/ThemeToggle";
import { Chat, Message, Attachment, ScheduledTodo } from "../lib/types";
import { chatWithGemini, generateSpeech } from "../lib/gemini";
import { formatFileSize } from "../lib/exportUtils";
import { motion, AnimatePresence } from "motion/react";

const PRESETS = [
  { id: "code", label: "Neural Architect", icon: <Cpu size={14} />, prompt: "Act as a senior software architect. Analyze this and suggest improvements for scalability: " },
  { id: "creative", label: "Creative Synthesis", icon: <Sparkles size={14} />, prompt: "Synthesize a creative concept or narrative based on: " },
  { id: "analyze", label: "Deep Analysis", icon: <FileText size={14} />, prompt: "Perform a deep technical analysis on the following: " },
];

type Mode = "chat" | "imagine" | "analyze";

const SUGGESTIONS = [
  { icon: <Cpu size={18} />, title: "Neural Logic", text: "Architect a scalable microservices system using Go and Kubernetes" },
  { icon: <FileText size={18} />, title: "Deep Analysis", text: "Deconstruct this technical whitepaper and identify architectural flaws" },
  { icon: <Wand2 size={18} />, title: "Visual Synthesis", text: "Synthesize a minimalist architectural render of a glass villa in a pine forest" },
  { icon: <Zap size={18} />, title: "Rapid Insight", text: "Explain the mathematical foundations of transformer architectures" },
];

const generateUniqueId = (prefix: string) => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const createInitialChat = (): Chat => {
  const id = generateUniqueId("chat");
  return { id, title: "Neural Session", messages: [], createdAt: new Date() };
};

const loadSavedChats = (): Chat[] => {
  try {
    const saved = localStorage.getItem("aether_chat_sessions");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt || Date.now()),
          updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined,
          messages: (c.messages || []).map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp || Date.now()),
          })),
        }));
      }
    }
  } catch (err) {
    console.error("Failed to load saved chats:", err);
  }
  return [createInitialChat()];
};

const loadInitialTodos = (): ScheduledTodo[] => {
  try {
    const stored = localStorage.getItem("aether_scheduled_todos");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to load todos:", e);
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const tom = new Date();
  tom.setDate(tom.getDate() + 1);
  const tomorrowStr = tom.toISOString().split("T")[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 4);
  const nextWeekStr = nextWeek.toISOString().split("T")[0];

  return [
    {
      id: "todo_1",
      title: "Review API token throughput and rate limits",
      description: "Ensure consumption stays within sustainable threshold across multimodal models.",
      dueDate: todayStr,
      dueTime: "16:00",
      priority: "high",
      completed: false,
      category: "Operations",
      createdAt: new Date().toISOString(),
    },
    {
      id: "todo_2",
      title: "Benchmark Gemini 3.0 Flash inference latency",
      description: "Analyze token generation velocity with streaming prompts and attachments.",
      dueDate: tomorrowStr,
      dueTime: "11:30",
      priority: "medium",
      completed: false,
      category: "Research",
      createdAt: new Date().toISOString(),
    },
    {
      id: "todo_3",
      title: "Implement automated neural session backups",
      description: "Verify persistent storage caching and markdown export routines.",
      dueDate: nextWeekStr,
      dueTime: "15:00",
      priority: "low",
      completed: true,
      category: "Development",
      createdAt: new Date().toISOString(),
    }
  ];
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>(() => loadSavedChats());
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    try {
      const saved = loadSavedChats();
      return saved[0]?.id || null;
    } catch {
      return null;
    }
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("chat");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [hasPromptedNearLimit, setHasPromptedNearLimit] = useState(false);

  // Export Modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportTargetChat, setExportTargetChat] = useState<Chat | null>(null);

  // Direct Drag & Drop state on input
  const [isDraggingOverInput, setIsDraggingOverInput] = useState(false);

  // Sidebar view: "sessions" vs "scheduled"
  const [sidebarView, setSidebarView] = useState<"sessions" | "scheduled">("sessions");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isExtractingAi, setIsExtractingAi] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Scheduled To-Dos state
  const [todos, setTodos] = useState<ScheduledTodo[]>(() => loadInitialTodos());

  // Count of pending tasks due today
  const todayStr = new Date().toISOString().split("T")[0];
  const todayTodosCount = todos.filter((t) => !t.completed && t.dueDate === todayStr).length;

  // Save chats to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem("aether_chat_sessions", JSON.stringify(chats));
    } catch (err) {
      console.error("Failed to persist chats to localStorage:", err);
    }
  }, [chats]);

  // Save todos to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem("aether_scheduled_todos", JSON.stringify(todos));
    } catch (err) {
      console.error("Failed to persist scheduled todos:", err);
    }
  }, [todos]);

  // Token usage tracking state (Default limit is 1,000,000 tokens)
  const [tokenLimit, setTokenLimit] = useState<number>(() => {
    try {
      const stored = localStorage.getItem("aether_token_limit");
      if (stored !== null) return parseInt(stored, 10);
      return 1000000;
    } catch {
      return 1000000;
    }
  });

  const [usedTokens, setUsedTokens] = useState<number>(() => {
    try {
      const stored = localStorage.getItem("aether_used_tokens");
      if (stored !== null) return parseInt(stored, 10);
      // Realistic starting baseline for the demonstration (e.g. 425,800 tokens)
      return 425800;
    } catch {
      return 425800;
    }
  });

  const [currentUser, setCurrentUser] = useState<{ name?: string; plan?: string } | null>(() => {
    try {
      const stored = localStorage.getItem("nexus_user");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const updateTokenConsumption = useCallback((addedTokens: number) => {
    setUsedTokens((prev) => {
      const nextVal = prev + addedTokens;
      try {
        localStorage.setItem("aether_used_tokens", nextVal.toString());
      } catch (e) {
        console.error(e);
      }
      // If approaching or exceeding 800,000 of the 1,000,000 limit, trigger Upgrade prompt
      if (nextVal >= 800000 && !hasPromptedNearLimit && tokenLimit <= 1000000) {
        setHasPromptedNearLimit(true);
        setShowUpgradeModal(true);
      }
      return nextVal;
    });
  }, [hasPromptedNearLimit, tokenLimit]);

  const handleUpgradeToPro = () => {
    const proLimit = 10000000; // 10 Million Pro Limit
    setTokenLimit(proLimit);
    try {
      localStorage.setItem("aether_token_limit", proLimit.toString());
      const updatedUser = {
        ...(currentUser || {}),
        name: currentUser?.name || "Neural Operator",
        plan: "Aether Pro Plan",
      };
      setCurrentUser(updatedUser);
      localStorage.setItem("nexus_user", JSON.stringify(updatedUser));
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetTokens = () => {
    setUsedTokens(0);
    setTokenLimit(1000000);
    try {
      localStorage.setItem("aether_used_tokens", "0");
      localStorage.setItem("aether_token_limit", "1000000");
      setHasPromptedNearLimit(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateTokens = (tokens: number) => {
    setUsedTokens(tokens);
    try {
      localStorage.setItem("aether_used_tokens", tokens.toString());
    } catch (e) {
      console.error(e);
    }
    if (tokens >= 800000) {
      setShowUpgradeModal(true);
    }
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync user state if updated in localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nexus_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const displayName = currentUser?.name?.trim() || "Neural Operator";
  const planStatus = currentUser?.plan || "Pro Plan";

  const getInitials = (nameStr: string) => {
    if (!nameStr) return "NO";
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };

  const userInitials = getInitials(displayName);

  // Sync activeChatId with chats
  useEffect(() => {
    if (chats.length > 0) {
      if (!activeChatId || !chats.some((c) => c.id === activeChatId)) {
        setActiveChatId(chats[0].id);
      }
    } else {
      const fresh = createInitialChat();
      setChats([fresh]);
      setActiveChatId(fresh.id);
    }
  }, [chats, activeChatId]);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  const createNewChat = useCallback(() => {
    const emptyChat = chats.find((c) => c.messages.length === 0);
    if (emptyChat) {
      setActiveChatId(emptyChat.id);
      setAttachments([]);
      setInput("");
      setShowUpload(false);
      setMode("chat");
      return;
    }

    const id = generateUniqueId("chat");
    const newChat: Chat = { id, title: "Neural Session", messages: [], createdAt: new Date(), updatedAt: new Date() };
    setChats((p) => [newChat, ...p]);
    setActiveChatId(id);
    setAttachments([]);
    setInput("");
    setShowUpload(false);
    setMode("chat");
  }, [chats]);

  // Handle files dropped directly onto prompt input
  const handleDirectFileDrop = useCallback(async (fileList: FileList) => {
    const ACCEPTED = [
      "image/png", "image/jpeg", "image/webp", "image/gif",
      "application/pdf",
      "text/plain", "text/csv", "text/markdown",
      "application/json",
    ];
    const MAX_SIZE = 10 * 1024 * 1024;
    const newAttachments: Attachment[] = [];

    for (const file of Array.from(fileList)) {
      if (!ACCEPTED.includes(file.type) && !file.name.endsWith(".txt") && !file.name.endsWith(".md")) continue;
      if (file.size > MAX_SIZE) continue;

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.readAsDataURL(file);
      });

      newAttachments.push({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        base64,
        mimeType: file.type || "application/octet-stream",
      });
    }

    if (newAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
  }, []);

  const deleteChat = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let nextActiveId: string | null = null;
    setChats((p) => {
      const remaining = p.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        const fresh = createInitialChat();
        nextActiveId = fresh.id;
        return [fresh];
      }
      if (activeChatId === id) {
        nextActiveId = remaining[0].id;
      }
      return remaining;
    });
    if (nextActiveId) {
      setActiveChatId(nextActiveId);
    }
  }, [activeChatId]);

  const handleRenameChat = useCallback((id: string, newTitle: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: new Date() } : c))
    );
  }, []);

  const handleTogglePin = useCallback((id: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  }, []);

  const handleDuplicateChat = useCallback((id: string) => {
    const target = chats.find((c) => c.id === id);
    if (!target) return;
    const clone: Chat = {
      id: generateUniqueId("chat"),
      title: `${target.title} (Copy)`,
      messages: target.messages.map((m) => ({
        ...m,
        id: generateUniqueId("msg"),
        timestamp: new Date(m.timestamp),
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      pinned: target.pinned,
    };
    setChats((prev) => [clone, ...prev]);
    setActiveChatId(clone.id);
  }, [chats]);

  const handleToggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const handleAddTodo = useCallback((todoData: Omit<ScheduledTodo, "id" | "createdAt">) => {
    const newTodo: ScheduledTodo = {
      ...todoData,
      id: generateUniqueId("todo"),
      createdAt: new Date().toISOString(),
      associatedChatId: activeChatId || undefined,
    };
    setTodos((prev) => [newTodo, ...prev]);
  }, [activeChatId]);

  const handleDeleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleAiExtractTasks = async () => {
    setIsExtractingAi(true);
    try {
      const recentMessages = activeChat?.messages || [];
      let promptContext = "";
      if (recentMessages.length > 0) {
        promptContext = recentMessages.slice(-6).map((m) => `${m.role}: ${m.content}`).join("\n");
      } else {
        promptContext = "Review Aether AI operational tasks, performance benchmarks, and development goals.";
      }

      const aiPrompt = `Based on the following conversation or project context, extract 2 to 3 concrete actionable scheduled tasks.
Context:
${promptContext}

Return ONLY a valid JSON array of objects with keys:
"title" (string, max 50 chars),
"description" (string, max 90 chars),
"daysFromNow" (number between 0 and 4),
"priority" ("high" | "medium" | "low"),
"category" ("Development" | "Research" | "Review" | "Operations")

Do NOT include markdown formatting or backticks, just the raw JSON array.`;

      const response = (await chatWithGemini(aiPrompt, [])) || "";
      let parsedTasks: any[] = [];
      try {
        const cleanJson = response.replace(/```json|```/g, "").trim();
        parsedTasks = JSON.parse(cleanJson);
      } catch {
        parsedTasks = [
          {
            title: `Follow up: ${activeChat?.title || "Neural Session"}`,
            description: "Review insights and synthesize next development phase.",
            daysFromNow: 0,
            priority: "high",
            category: "Review"
          },
          {
            title: "Performance & Token Audit",
            description: "Benchmark inference speed and token allocation limits.",
            daysFromNow: 1,
            priority: "medium",
            category: "Operations"
          }
        ];
      }

      if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
        const now = new Date();
        const newItems: ScheduledTodo[] = parsedTasks.map((t, idx) => {
          const d = new Date();
          d.setDate(now.getDate() + (typeof t.daysFromNow === "number" ? t.daysFromNow : idx));
          return {
            id: generateUniqueId("todo"),
            title: t.title || "Neural Action Item",
            description: t.description,
            dueDate: d.toISOString().split("T")[0],
            dueTime: "14:00",
            priority: t.priority === "high" || t.priority === "low" ? t.priority : "medium",
            completed: false,
            category: t.category || "Development",
            createdAt: new Date().toISOString(),
            associatedChatId: activeChat?.id,
          };
        });

        setTodos((prev) => [...newItems, ...prev]);
      }
    } catch (error) {
      console.error("AI Task extraction error:", error);
    } finally {
      setIsExtractingAi(false);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading || !activeChatId) return;

    const chatId = activeChatId;
    const isAnalyze = mode === "analyze" || attachments.length > 0;
    
    const userMsg: Message = {
      id: generateUniqueId("msg"),
      role: "user",
      content: input.trim() || (attachments.length > 0 ? (isAnalyze ? "[Neural Analysis Requested]" : `[Neural Input: ${attachments.map(a => a.name).join(", ")}]`) : ""),
      timestamp: new Date(),
      attachments: attachments.length ? [...attachments] : undefined,
    };

    setChats(prev => prev.map(c => 
      c.id === chatId ? { 
        ...c, 
        messages: [...c.messages, userMsg],
        title: c.messages.length === 0 
          ? (input.trim() || (attachments.length > 0 ? attachments[0].name : "Neural Session")).slice(0, 30) 
          : c.title
      } : c
    ));

    const savedInput = input.trim();
    const savedAtts = [...attachments];
    setInput(""); setAttachments([]); setShowUpload(false); setIsLoading(true);

    if (mode === "imagine") {
      const aiMsg: Message = {
        id: generateUniqueId("msg"),
        role: "assistant",
        content: `Synthesizing visual representation for: **"${savedInput}"**...`,
        timestamp: new Date(),
      };
      setChats(prev => prev.map(c => 
        c.id === chatId ? { ...c, messages: [...c.messages, aiMsg] } : c
      ));

      try {
        await new Promise(r => setTimeout(r, 2500));
        const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(savedInput)}/1024/1024?grayscale`;
        
        setChats(prev => prev.map(c => {
          if (c.id !== chatId) return c;
          const msgs = [...c.messages];
          msgs[msgs.length - 1] = {
            ...msgs[msgs.length - 1],
            content: `Visual synthesis complete for: **"${savedInput}"**`,
            images: [{ url: imageUrl, prompt: savedInput }]
          };
          return { ...c, messages: msgs };
        }));
        // Tokens for image generation
        updateTokenConsumption(1500);
      } catch (error) {
        console.error(error);
        setChats(prev => prev.map(c => {
          if (c.id !== chatId) return c;
          const msgs = [...c.messages];
          msgs[msgs.length - 1] = {
            ...msgs[msgs.length - 1],
            content: "Synthesis failed. Neural link interrupted."
          };
          return { ...c, messages: msgs };
        }));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const history = (activeChat?.messages ?? []).map(m => {
        const parts: any[] = [{ text: m.content }];
        if (m.attachments) {
          m.attachments.forEach(att => {
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: att.base64
              }
            });
          });
        }
        return {
          role: m.role === "user" ? "user" as const : "model" as const,
          parts
        };
      });

      const reply = await chatWithGemini(savedInput, history, savedAtts);

      const aiMsg: Message = {
        id: generateUniqueId("msg"),
        role: "assistant",
        content: reply || "Neural core returned null response.",
        timestamp: new Date(),
      };

      setChats(prev => prev.map(c => 
        c.id === chatId ? { ...c, messages: [...c.messages, aiMsg] } : c
      ));

      // Calculate prompt and model completion token usage
      const promptTokens = Math.max(15, Math.ceil((savedInput.length + savedAtts.length * 450) / 4));
      const completionTokens = Math.max(30, Math.ceil((reply?.length || 100) / 4));
      updateTokenConsumption(promptTokens + completionTokens);
    } catch (error: any) {
      console.error(error);
      const errorMsg: Message = {
        id: generateUniqueId("msg"),
        role: "assistant",
        content: `Neural link failure: ${error.message || "Protocol error detected."}`,
        timestamp: new Date(),
      };
      setChats(prev => prev.map(c => 
        c.id === chatId ? { ...c, messages: [...c.messages, errorMsg] } : c
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFeedback = (msgId: string, type: "like" | "dislike") => {
    setChats(prev => prev.map(c => {
      if (c.id !== activeChatId) return c;
      return {
        ...c,
        messages: c.messages.map(m => m.id === msgId ? { ...m, feedback: type } : m)
      };
    }));
  };

  const handleSpeak = async (text: string) => {
    try {
      const base64 = await generateSpeech(text);
      if (base64) {
        // Gemini TTS returns raw PCM 24kHz (16-bit). We play it using AudioContext.
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Convert Uint8Array (PCM 16-bit) to Float32Array
        const pcmData = new Int16Array(bytes.buffer);
        const floatData = new Float32Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
          floatData[i] = pcmData[i] / 32768.0;
        }

        const audioBuffer = audioContext.createBuffer(1, floatData.length, 24000);
        audioBuffer.getChannelData(0).set(floatData);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
      }
    } catch (error) {
      console.error("Speech synthesis failed:", error);
    }
  };

  return (
    <div className="flex h-screen bg-bg overflow-hidden selection:bg-white/10">
      {/* Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-md z-30 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Responsive drawer on mobile, persistent on md+) */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-80 max-w-[85vw] flex-shrink-0 bg-surface border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 sm:p-8 border-b border-white/5">
          <div className="flex items-center justify-between mb-8 sm:mb-10">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                <Command className="text-black" size={20} />
              </div>
              <span className="font-display font-black text-2xl tracking-tighter uppercase italic">Aether</span>
            </Link>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                title="Neural Settings"
              >
                <Settings size={18} />
              </button>
              <button 
                onClick={() => setShowFeedback(true)}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:bg-white/10 transition-all"
                title="Send Feedback"
              >
                <MessageSquare size={18} />
              </button>
              <button 
                onClick={() => { createNewChat(); setIsMobileSidebarOpen(false); }}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                title="New Neural Session"
              >
                <Plus size={18} />
              </button>

              {/* Close WRONG SIGN (X) on mobile */}
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="md:hidden p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
                title="Close sidebar (wrong sign)"
                aria-label="Close sidebar"
              >
                <X size={18} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* View Switcher: Sessions vs Scheduled Tasks */}
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 mb-3">
            <button 
              type="button"
              onClick={() => setSidebarView("sessions")}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5
                ${sidebarView === "sessions" 
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] font-black" 
                  : "text-text-secondary hover:text-white"
                }`}
            >
              <MessageSquare size={13} />
              <span>Chats ({chats.length})</span>
            </button>
            <button 
              type="button"
              onClick={() => setSidebarView("scheduled")}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5
                ${sidebarView === "scheduled" 
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] font-black" 
                  : "text-text-secondary hover:text-white"
                }`}
            >
              <Calendar size={13} />
              <span>Schedule</span>
              {todayTodosCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                  sidebarView === "scheduled" ? "bg-amber-400 text-black" : "bg-amber-500/20 text-amber-300"
                }`}>
                  {todayTodosCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex p-1 bg-white/[0.02] rounded-xl border border-white/5">
            {(["chat", "imagine"] as Mode[]).map((m) => (
              <button 
                key={m} 
                onClick={() => setMode(m)}
                className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
                  ${mode === m 
                    ? "bg-white/10 text-white font-bold" 
                    : "text-text-secondary hover:text-white"
                  }`}
              >
                {m === "chat" ? <MessageSquare size={12} /> : <Wand2 size={12} />}
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Sidebar Content: Chat Sessions List OR Scheduled To-Dos */}
        {sidebarView === "sessions" ? (
          <SidebarSessionList
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={(id) => {
              setActiveChatId(id);
              setIsMobileSidebarOpen(false);
            }}
            onCreateNewChat={() => {
              createNewChat();
              setIsMobileSidebarOpen(false);
            }}
            onDeleteChat={deleteChat}
            onRenameChat={handleRenameChat}
            onTogglePin={handleTogglePin}
            onDuplicateChat={handleDuplicateChat}
            onOpenExportModal={(chat) => {
              setExportTargetChat(chat);
              setShowExportModal(true);
            }}
          />
        ) : (
          <ScheduledTodoList
            todos={todos}
            onToggleTodo={handleToggleTodo}
            onAddTodo={handleAddTodo}
            onDeleteTodo={handleDeleteTodo}
            onAiExtractTasks={handleAiExtractTasks}
            isExtractingAi={isExtractingAi}
          />
        )}

        <div className="p-5 border-t border-white/5 space-y-4">
          {/* Token Consumption Tracker with Progress Bar */}
          <TokenUsageTracker
            usedTokens={usedTokens}
            totalLimit={tokenLimit}
            onOpenUpgrade={() => setShowUpgradeModal(true)}
            onSimulateTokens={handleSimulateTokens}
            planName={planStatus}
          />

          <div className="flex items-center gap-4 p-4 rounded-[2rem] bg-white/5 border border-white/5">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center font-bold text-black text-xs select-none shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {userInitials}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-surface" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate uppercase tracking-widest text-white" title={displayName}>
                {displayName}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">
                  {planStatus}
                </span>
              </div>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem("nexus_user");
                navigate("/login");
              }}
              className="p-3 rounded-xl hover:bg-white/5 text-text-secondary hover:text-white transition-all shrink-0"
              title="Terminate Session"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-4 sm:px-8 md:px-12 bg-bg/40 backdrop-blur-3xl sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Sidebar Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer shrink-0"
              title="Open Session List"
              aria-label="Open sessions sidebar"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="font-display font-extrabold text-base sm:text-xl uppercase tracking-tighter truncate">{activeChat?.title || "Neural Session"}</h1>
              <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-text-secondary font-bold uppercase tracking-[0.2em]">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
                <span className="hidden xs:inline">Intelligence Core · </span>Synchronized
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
            {/* Scheduled Tasks Modal Trigger in Header */}
            <button 
              onClick={() => setShowScheduleModal(true)}
              className="btn-secondary py-2 sm:py-2.5 px-3 sm:px-3.5 text-[10px] uppercase tracking-widest flex items-center gap-2 relative text-white hover:text-emerald-300"
              title="Scheduled Tasks & To-Do Manager"
            >
              <Calendar size={14} className="text-emerald-400" /> 
              <span className="hidden sm:inline">Schedule</span>
              {todayTodosCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black font-black text-[9px]">
                  {todayTodosCount}
                </span>
              )}
            </button>

            {/* Export Conversation Button */}
            <button 
              onClick={() => {
                if (activeChat) {
                  setExportTargetChat(activeChat);
                  setShowExportModal(true);
                }
              }}
              className="btn-secondary py-2 sm:py-2.5 px-3 sm:px-3.5 text-[10px] uppercase tracking-widest flex items-center gap-2 relative text-white hover:text-cyan-300"
              title="Export conversation history as Markdown (.md) or Text (.txt)"
            >
              <Download size={14} className="text-cyan-400" /> 
              <span className="hidden md:inline">Export</span>
            </button>

            <Link 
              to="/report"
              className="btn-secondary py-2 sm:py-2.5 px-3 sm:px-4 text-[10px] uppercase tracking-widest flex items-center gap-2"
              title="System Diagnostics & Real-time Metrics"
            >
              <BarChart3 size={14} className="text-emerald-400" /> 
              <span className="hidden sm:inline">System Report</span>
            </Link>
            <button 
              onClick={() => setShowHelp(true)}
              className="hidden lg:flex btn-secondary py-2.5 px-4 text-[10px] uppercase tracking-widest items-center gap-2"
              title="Core Documentation & Guides"
            >
              <FileText size={14} /> 
              <span>Docs</span>
            </button>
            <button 
              onClick={() => { setMode("analyze"); setShowUpload(true); }}
              className="hidden sm:flex btn-secondary py-2.5 px-4 text-[10px] uppercase tracking-widest items-center gap-2"
              title="Attach Neural Input Documents"
            >
              <Paperclip size={14} /> 
              <span>Input</span>
            </button>

            {/* Quick Token Consumption indicator & Upgrade prompt trigger in Header */}
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className={`btn-secondary py-2.5 px-3.5 text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${
                usedTokens >= 800000 
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20" 
                  : "border-emerald-500/30 text-emerald-300 hover:border-emerald-400"
              }`}
              title="API Token Usage & Upgrade to Pro"
            >
              <Zap size={13} className={usedTokens >= 800000 ? "text-amber-400 animate-pulse" : "text-emerald-400"} />
              <span className="font-mono">{Math.round((usedTokens / tokenLimit) * 100)}% Used</span>
              {usedTokens >= 800000 && (
                <span className="hidden xl:inline px-1.5 py-0.5 rounded bg-amber-400 text-black font-black text-[9px] uppercase">
                  Upgrade
                </span>
              )}
            </button>

            <div className="w-px h-8 bg-white/5" />
            <ThemeToggle showLabel />
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-8 py-12">
          <div className="max-w-4xl mx-auto space-y-12">
            {(!activeChat || activeChat.messages.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-24 h-24 rounded-[2.5rem] bg-white flex items-center justify-center mb-12 shadow-[0_0_60px_rgba(255,255,255,0.2)]"
                >
                  <Command size={40} className="text-black" />
                </motion.div>
                <h2 className="font-display font-black text-5xl mb-6 tracking-tighter italic uppercase">Aether Intelligence Core</h2>
                <p className="text-text-secondary max-w-md mb-12 font-light text-lg">
                  Aether is ready to assist you. Synchronize your neural patterns or upload data to begin.
                </p>

                <div className="flex flex-wrap justify-center gap-3 mb-16">
                  {PRESETS.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => setInput(p.prompt)}
                      className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white hover:text-black transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-3"
                    >
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                  {SUGGESTIONS.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setInput(s.text);
                        if (s.title === "Deep Analysis") { setMode("analyze"); setShowUpload(true); }
                        else if (s.title === "Visual Synthesis") setMode("imagine");
                        textareaRef.current?.focus();
                      }}
                      className="glass glass-hover p-8 rounded-[2rem] text-left flex items-start gap-6 border-white/5"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                        {s.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold mb-2 uppercase tracking-widest">{s.title}</div>
                        <div className="text-sm text-text-secondary leading-relaxed font-light">{s.text}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {activeChat.messages.map((msg) => (
                  <ChatMessage 
                    key={msg.id} 
                    message={msg} 
                    onFeedback={handleFeedback}
                    onSpeak={handleSpeak}
                  />
                ))}
                {isLoading && (
                  <div className="flex gap-6 animate-in fade-in duration-700">
                    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-2xl flex-shrink-0">
                      <Command size={20} className="text-black" />
                    </div>
                    <div className="bg-surface border border-white/5 px-6 py-5 rounded-[2rem] rounded-tl-none flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-8 bg-bg/40 backdrop-blur-3xl border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence>
              {showUpload && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <FileUploadZone 
                    files={attachments}
                    onFilesReady={(f) => setAttachments(p => [...p, ...f])}
                    onRemove={(i) => setAttachments(p => p.filter((_, idx) => idx !== i))}
                    onClearAll={() => setAttachments([])}
                    onClose={() => setShowUpload(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div 
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOverInput(true);
              }}
              onDragLeave={() => setIsDraggingOverInput(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOverInput(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleDirectFileDrop(e.dataTransfer.files);
                }
              }}
              className={`relative glass rounded-[2rem] p-3 transition-all duration-300 ring-1
                ${isDraggingOverInput 
                  ? "ring-2 ring-cyan-400 bg-cyan-950/30 border-cyan-400/40" 
                  : isLoading 
                    ? "ring-white/5" 
                    : "ring-white/5 focus-within:ring-white/20 focus-within:bg-white/5"
                }`}
            >
              {/* Staged Attachments Bar inside Input Container */}
              {attachments.length > 0 && (
                <div className="px-3 pt-2 pb-2.5 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 bg-white/[0.02] rounded-2xl mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      <Paperclip size={12} />
                      <span>Attached ({attachments.length}):</span>
                    </div>

                    {attachments.map((att, idx) => (
                      <div 
                        key={`${att.name}-${idx}`}
                        className="flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-xl bg-surface border border-white/10 text-white text-[11px] font-medium transition-all group"
                      >
                        {att.type.startsWith("image/") && att.base64 ? (
                          <img 
                            src={`data:${att.mimeType || att.type};base64,${att.base64}`} 
                            alt={att.name} 
                            className="w-4 h-4 rounded object-cover border border-white/10"
                          />
                        ) : (
                          <span className="text-white/70">
                            {att.type === "application/pdf" ? <FileText size={12} className="text-rose-400" /> : <FileText size={12} className="text-cyan-400" />}
                          </span>
                        )}
                        <span className="max-w-[120px] sm:max-w-[180px] truncate" title={att.name}>
                          {att.name}
                        </span>
                        <span className="text-[9px] font-mono text-text-secondary">
                          {formatFileSize(att.size)}
                        </span>

                        {/* Remove button for individual file */}
                        <button
                          type="button"
                          onClick={() => setAttachments(p => p.filter((_, i) => i !== idx))}
                          className="p-1 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/20 transition-all ml-0.5"
                          title={`Don't add this file: remove ${att.name}`}
                          aria-label={`Remove file ${att.name}`}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Clear all attachments: "Don't add files" */}
                  <button
                    type="button"
                    onClick={() => setAttachments([])}
                    className="text-[10px] font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ml-auto"
                    title="Remove all attached files and send prompt without files"
                  >
                    <Trash2 size={12} />
                    <span>Don&apos;t add files</span>
                  </button>
                </div>
              )}

              <div className="flex items-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowUpload(!showUpload)}
                  className={`p-4 rounded-2xl transition-colors relative
                    ${showUpload || attachments.length > 0 ? "text-white bg-white/10" : "text-text-secondary hover:text-white hover:bg-white/5"}`}
                  title={attachments.length > 0 ? `${attachments.length} files attached · Click to toggle upload zone` : "Attach files or drop documents here"}
                >
                  <Paperclip size={22} />
                  {attachments.length > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-400 text-black text-[9px] font-black flex items-center justify-center shadow-lg animate-in zoom-in">
                      {attachments.length}
                    </span>
                  )}
                </button>

                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
                  }}
                  onKeyDown={handleKey}
                  placeholder={mode === "imagine" ? "Describe ethereal vision..." : "Enter neural prompt..."}
                  className="flex-1 bg-transparent border-none outline-none py-4 px-3 text-base text-white placeholder:text-text-secondary resize-none max-h-[200px] font-light"
                />

                <button 
                  onClick={handleSend}
                  disabled={(!input.trim() && attachments.length === 0) || isLoading}
                  className={`p-4 rounded-2xl transition-all duration-500
                    ${(!input.trim() && attachments.length === 0) || isLoading 
                      ? "bg-white/5 text-text-secondary cursor-not-allowed" 
                      : "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95"
                    }`}
                >
                  {mode === "imagine" ? <Wand2 size={22} /> : <Send size={22} />}
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center px-4">
              <div className="text-[10px] text-text-secondary font-bold uppercase tracking-[0.3em]">
                {mode === "imagine" ? "Visual Synthesis Active" : "Neural Link Established"}
              </div>
              <div className="text-[10px] text-text-secondary font-mono tracking-widest">
                {input.length} / 4000
              </div>
            </div>
          </div>
        </div>
      </main>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        onClearHistory={() => {
          const fresh = createInitialChat();
          setChats([fresh]);
          setActiveChatId(fresh.id);
          try {
            localStorage.removeItem("aether_chat_sessions");
          } catch (e) {
            console.error(e);
          }
          handleResetTokens();
        }}
      />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
      <UpgradeToProModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        usedTokens={usedTokens}
        totalLimit={tokenLimit}
        onUpgrade={handleUpgradeToPro}
        onReset={handleResetTokens}
      />
      <ScheduledTodoModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        todos={todos}
        onToggleTodo={handleToggleTodo}
        onAddTodo={handleAddTodo}
        onDeleteTodo={handleDeleteTodo}
        onAiExtractTasks={handleAiExtractTasks}
        isExtractingAi={isExtractingAi}
      />
      <ExportSessionModal
        isOpen={showExportModal}
        onClose={() => {
          setShowExportModal(false);
          setExportTargetChat(null);
        }}
        chat={exportTargetChat || activeChat}
      />
    </div>
  );
}
