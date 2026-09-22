import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Download, Copy, Check, FileText, FileCode,
  Clock, Paperclip, SlidersHorizontal
} from "lucide-react";
import { Chat } from "../lib/types";
import {
  generateMarkdownExport,
  generatePlainTextExport,
  downloadChatAsMarkdown,
  downloadChatAsText,
  copyExportToClipboard,
} from "../lib/exportUtils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat | null;
}

export default function ExportSessionModal({ isOpen, onClose, chat }: Props) {
  const [format, setFormat] = useState<"markdown" | "text">("markdown");
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [copied, setCopied] = useState(false);

  // Generate preview content reactively
  const previewContent = useMemo(() => {
    if (!chat) return "";
    const options = {
      includeTimestamps,
      includeAttachments,
      includeMetadata,
    };
    return format === "markdown" 
      ? generateMarkdownExport(chat, options)
      : generatePlainTextExport(chat, options);
  }, [chat, format, includeTimestamps, includeAttachments, includeMetadata]);

  if (!isOpen || !chat) return null;

  const handleCopy = async () => {
    const ok = await copyExportToClipboard(previewContent);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    downloadChatAsMarkdown(chat, {
      includeTimestamps,
      includeAttachments,
      includeMetadata,
    });
  };

  const handleDownloadText = () => {
    downloadChatAsText(chat, {
      includeTimestamps,
      includeAttachments,
      includeMetadata,
    });
  };

  const handleDownloadActiveFormat = () => {
    if (format === "markdown") {
      handleDownloadMarkdown();
    } else {
      handleDownloadText();
    }
  };

  const totalAttachmentsCount = chat.messages.reduce(
    (sum, m) => sum + (m.attachments?.length || 0),
    0
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-surface/95 border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden text-white z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 text-emerald-400">
                <Download size={18} />
              </div>
              <div>
                <h3 className="font-display font-black text-lg tracking-tight uppercase">Export Chat Session</h3>
                <p className="text-xs text-text-secondary font-mono truncate max-w-sm sm:max-w-md">
                  {chat.title} · {chat.messages.length} messages {totalAttachmentsCount > 0 ? `· ${totalAttachmentsCount} files` : ""}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Controls Bar: Format Selector + Options */}
          <div className="p-5 border-b border-white/5 bg-white/[0.02] space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {/* Format Toggle Buttons */}
              <div className="flex p-1 bg-black/40 rounded-xl border border-white/10 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setFormat("markdown")}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    format === "markdown"
                      ? "bg-white text-black shadow-lg font-black"
                      : "text-text-secondary hover:text-white"
                  }`}
                >
                  <FileCode size={14} />
                  <span>Markdown (.md)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("text")}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    format === "text"
                      ? "bg-white text-black shadow-lg font-black"
                      : "text-text-secondary hover:text-white"
                  }`}
                >
                  <FileText size={14} />
                  <span>Plain Text (.txt)</span>
                </button>
              </div>

              {/* Format Badge */}
              <div className="text-[11px] font-mono text-text-secondary flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Ready to download as <strong>{format === "markdown" ? ".md file" : ".txt file"}</strong></span>
              </div>
            </div>

            {/* Customization Checkbox Options */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-text-secondary">
              <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={includeTimestamps}
                  onChange={(e) => setIncludeTimestamps(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-emerald-400 focus:ring-0"
                />
                <span className="flex items-center gap-1">
                  <Clock size={12} /> Timestamps
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={includeAttachments}
                  onChange={(e) => setIncludeAttachments(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-emerald-400 focus:ring-0"
                />
                <span className="flex items-center gap-1">
                  <Paperclip size={12} /> Attachment info
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-emerald-400 focus:ring-0"
                />
                <span className="flex items-center gap-1">
                  <SlidersHorizontal size={12} /> Header metadata
                </span>
              </label>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="flex-1 min-h-[220px] max-h-[360px] p-5 overflow-y-auto bg-black/50 font-mono text-xs text-text-secondary border-b border-white/5 space-y-1">
            <div className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 flex items-center justify-between">
              <span>Preview ({format === "markdown" ? "Markdown syntax" : "Plain text"})</span>
              <span>{previewContent.length} characters</span>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-emerald-300/90 select-text">
              {previewContent}
            </pre>
          </div>

          {/* Footer Actions */}
          <div className="p-5 bg-surface flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Copy button */}
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold tracking-wide flex items-center justify-center gap-2 text-white transition-all active:scale-95"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy to Clipboard"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Secondary Download Button (the other format) */}
              <button
                type="button"
                onClick={format === "markdown" ? handleDownloadText : handleDownloadMarkdown}
                className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-text-secondary hover:text-white transition-all flex items-center justify-center gap-1.5"
                title={`Quickly download as ${format === "markdown" ? ".txt" : ".md"}`}
              >
                <Download size={13} />
                <span>Save as {format === "markdown" ? ".txt" : ".md"}</span>
              </button>

              {/* Primary Download Button */}
              <button
                type="button"
                onClick={handleDownloadActiveFormat}
                className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl bg-white text-black hover:bg-emerald-400 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-white/10 transition-all hover:scale-105 active:scale-95"
              >
                <Download size={15} />
                <span>Download {format === "markdown" ? ".MD" : ".TXT"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
