import { useState, useMemo } from "react";
import { 
  Plus, Search, MessageSquare, Trash2, Edit2, Check, X, 
  Pin, Copy, Download, Clock, Sparkles, FileCode, FileText
} from "lucide-react";
import { Chat } from "../lib/types";
import { downloadChatAsMarkdown, downloadChatAsText } from "../lib/exportUtils";

interface SidebarSessionListProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onCreateNewChat: () => void;
  onDeleteChat: (id: string, e?: React.MouseEvent) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onTogglePin?: (id: string) => void;
  onDuplicateChat?: (id: string) => void;
  onOpenExportModal?: (chat: Chat) => void;
}

export default function SidebarSessionList({
  chats,
  activeChatId,
  onSelectChat,
  onCreateNewChat,
  onDeleteChat,
  onRenameChat,
  onTogglePin,
  onDuplicateChat,
  onOpenExportModal,
}: SidebarSessionListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [exportMenuChatId, setExportMenuChatId] = useState<string | null>(null);

  // Format relative timestamp
  const formatRelativeTime = (dateInput: Date | string | undefined) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const handleStartRename = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveRename = (id: string, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
  };

  const handleExportChat = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenExportModal) {
      onOpenExportModal(chat);
    } else {
      downloadChatAsMarkdown(chat);
    }
  };

  const handleExportChatMarkdown = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    downloadChatAsMarkdown(chat);
    setExportMenuChatId(null);
  };

  const handleExportChatText = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    downloadChatAsText(chat);
    setExportMenuChatId(null);
  };

  // Filtered and sorted chats (pinned first, then by date)
  const filteredChats = useMemo(() => {
    let result = [...chats];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.messages.some(m => m.content.toLowerCase().includes(q))
      );
    }
    // Sort: pinned first, then newest updated/created
    return result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      const timeA = new Date(a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt).getTime();
      return timeB - timeA;
    });
  }, [chats, searchQuery]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Session Actions & Search */}
      <div className="px-5 pt-3 pb-2 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
            <MessageSquare size={13} className="text-white/60" />
            <span>Chat Sessions ({chats.length})</span>
          </div>
          <span className="text-[9px] font-mono text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            Auto-Saved
          </span>
        </div>

        {/* Quick New Session Button */}
        <button
          type="button"
          onClick={onCreateNewChat}
          className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all group shadow-sm"
          title="Start a new chat conversation"
        >
          <Plus size={15} className="group-hover:rotate-90 transition-transform text-emerald-400" />
          <span>New Neural Session</span>
        </button>

        {/* Search Bar */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-white/[0.03] border border-white/5 focus:border-white/20 rounded-xl pl-8 pr-7 py-2 text-xs text-white placeholder:text-text-secondary/50 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Session List Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 custom-scrollbar">
        {filteredChats.length === 0 ? (
          <div className="text-center py-10 px-4 space-y-2">
            <p className="text-xs text-text-secondary">
              {searchQuery ? "No matching conversations found." : "No saved sessions."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                Clear search filter
              </button>
            )}
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = activeChatId === chat.id;
            const isEditing = editingChatId === chat.id;
            const isConfirmingDelete = deleteConfirmId === chat.id;

            return (
              <div
                key={chat.id}
                onClick={() => !isEditing && onSelectChat(chat.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !isEditing) {
                    e.preventDefault();
                    onSelectChat(chat.id);
                  }
                }}
                className={`w-full group relative flex flex-col p-3 rounded-2xl transition-all border text-left cursor-pointer select-none ${
                  isActive
                    ? "bg-white/10 border-white/20 text-white shadow-lg shadow-black/20"
                    : "border-transparent text-text-secondary hover:bg-white/5 hover:text-white hover:border-white/5"
                }`}
              >
                {/* Header row: Title & Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {chat.pinned && (
                      <Pin size={11} className="text-amber-400 shrink-0 rotate-45" />
                    )}
                    
                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleSaveRename(chat.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 flex-1"
                      >
                        <input
                          type="text"
                          autoFocus
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="bg-black/60 border border-white/30 rounded-lg px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-emerald-400"
                        />
                        <button
                          type="submit"
                          className="p-1 rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40"
                          title="Save title"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelRename}
                          className="p-1 rounded-md bg-white/10 text-white hover:bg-white/20"
                          title="Cancel"
                        >
                          <X size={12} />
                        </button>
                      </form>
                    ) : (
                      <span className={`text-xs font-bold truncate uppercase tracking-wider ${isActive ? "text-white" : "text-white/80"}`}>
                        {chat.title}
                      </span>
                    )}
                  </div>

                  {/* Hover Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {onTogglePin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(chat.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-amber-400 transition-all"
                          title={chat.pinned ? "Unpin session" : "Pin session to top"}
                        >
                          <Pin size={12} className={chat.pinned ? "fill-amber-400 text-amber-400" : ""} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleStartRename(chat, e)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-all"
                        title="Rename conversation"
                      >
                        <Edit2 size={12} />
                      </button>

                      {onDuplicateChat && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateChat(chat.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-all"
                          title="Duplicate session"
                        >
                          <Copy size={12} />
                        </button>
                      )}

                      {chat.messages.length > 0 && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => handleExportChat(chat, e)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-all flex items-center gap-0.5"
                            title="Export conversation history (.md or .txt)"
                          >
                            <Download size={12} />
                          </button>

                          {exportMenuChatId === chat.id && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 z-30 w-36 bg-surface/95 border border-white/10 rounded-xl p-1 shadow-2xl backdrop-blur-md text-[10px] animate-in fade-in"
                            >
                              <button
                                type="button"
                                onClick={(e) => handleExportChatMarkdown(chat, e)}
                                className="w-full px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left flex items-center gap-2 text-white font-medium"
                              >
                                <FileCode size={11} className="text-emerald-400" />
                                <span>Markdown (.md)</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleExportChatText(chat, e)}
                                className="w-full px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left flex items-center gap-2 text-white font-medium"
                              >
                                <FileText size={11} className="text-cyan-400" />
                                <span>Plain Text (.txt)</span>
                              </button>
                              {onOpenExportModal && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExportMenuChatId(null);
                                    onOpenExportModal(chat);
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left flex items-center gap-2 text-text-secondary hover:text-white border-t border-white/5 mt-0.5 pt-1"
                                >
                                  <Sparkles size={11} />
                                  <span>Preview &amp; More</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isConfirmingDelete) {
                            onDeleteChat(chat.id, e);
                            setDeleteConfirmId(null);
                          } else {
                            setDeleteConfirmId(chat.id);
                            setTimeout(() => setDeleteConfirmId(null), 3000);
                          }
                        }}
                        className={`p-1.5 rounded-lg transition-all ${
                          isConfirmingDelete
                            ? "bg-rose-500 text-white"
                            : "hover:bg-rose-500/20 text-text-secondary hover:text-rose-400"
                        }`}
                        title={isConfirmingDelete ? "Click again to confirm delete" : "Delete conversation"}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Sub row: Message preview / Units count & Timestamp */}
                <div className="flex items-center justify-between text-[10px] text-text-secondary font-mono mt-1 pt-1 border-t border-white/[0.03]">
                  <span className="flex items-center gap-1 opacity-70">
                    <Sparkles size={10} className={isActive ? "text-emerald-400" : ""} />
                    <span>{chat.messages.length} message{chat.messages.length === 1 ? "" : "s"}</span>
                  </span>
                  
                  <span className="flex items-center gap-1 opacity-50">
                    <Clock size={9} />
                    <span>{formatRelativeTime(chat.updatedAt || chat.createdAt)}</span>
                  </span>
                </div>

                {/* Delete confirmation banner */}
                {isConfirmingDelete && (
                  <div className="mt-2 p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-semibold flex items-center justify-between">
                    <span>Delete this conversation?</span>
                    <span className="font-bold text-rose-400 underline">Confirm</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
