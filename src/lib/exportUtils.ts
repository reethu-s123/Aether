import { Chat, Attachment } from "./types";

export interface ExportOptions {
  format: "markdown" | "text";
  includeTimestamps?: boolean;
  includeAttachments?: boolean;
  includeMetadata?: boolean;
  operatorLabel?: string;
  assistantLabel?: string;
}

/**
 * Format bytes into readable string (e.g., 245 KB, 1.2 MB)
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format timestamp nicely for export documents
 */
export function formatExportDate(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Unknown Date";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Clean title for safe filesystem filename
 */
export function sanitizeFilename(title: string, fallback = "chat-session"): string {
  const sanitized = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return sanitized || fallback;
}

/**
 * Generate Markdown (.md) export text from a Chat session
 */
export function generateMarkdownExport(
  chat: Chat,
  options: Partial<ExportOptions> = {}
): string {
  const {
    includeTimestamps = true,
    includeAttachments = true,
    includeMetadata = true,
    operatorLabel = "Operator",
    assistantLabel = "Aether Intelligence",
  } = options;

  const lines: string[] = [];

  // Header / Metadata
  lines.push(`# ${chat.title || "Neural Session"}`);
  lines.push("");

  if (includeMetadata) {
    const exportTime = formatExportDate(new Date());
    const sessionTime = formatExportDate(chat.createdAt);
    const updatedTime = chat.updatedAt ? formatExportDate(chat.updatedAt) : sessionTime;

    lines.push(`> **Platform:** Remix: Aether AI`);
    lines.push(`> **Exported:** ${exportTime}`);
    lines.push(`> **Created:** ${sessionTime}`);
    lines.push(`> **Last Active:** ${updatedTime}`);
    lines.push(`> **Total Messages:** ${chat.messages.length}`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  if (chat.messages.length === 0) {
    lines.push("*No conversation messages recorded in this session.*");
    return lines.join("\n");
  }

  // Messages Loop
  chat.messages.forEach((msg, index) => {
    const isUser = msg.role === "user";
    const sender = isUser ? `👤 ${operatorLabel}` : `⚡ ${assistantLabel}`;
    const timeStr = includeTimestamps ? ` · *${formatExportDate(msg.timestamp)}*` : "";

    lines.push(`### ${sender}${timeStr}`);
    lines.push("");

    // Message body
    lines.push(msg.content || "*(Empty response)*");
    lines.push("");

    // Message attachments
    if (includeAttachments && msg.attachments && msg.attachments.length > 0) {
      lines.push("##### 📎 Attached Files:");
      msg.attachments.forEach((att: Attachment) => {
        const sizeStr = formatFileSize(att.size);
        lines.push(`- **${att.name}** (${att.type || "file"}, ${sizeStr})`);
      });
      lines.push("");
    }

    // Generated images if present
    if (msg.images && msg.images.length > 0) {
      lines.push("##### 🎨 Synthesized Images:");
      msg.images.forEach((img, imgIdx) => {
        lines.push(`- Image ${imgIdx + 1}: *"${img.prompt || "Neural Visual"}"*`);
      });
      lines.push("");
    }

    // Divider between messages (except the last one)
    if (index < chat.messages.length - 1) {
      lines.push("---");
      lines.push("");
    }
  });

  return lines.join("\n");
}

/**
 * Generate Plain Text (.txt) export string from a Chat session
 */
export function generatePlainTextExport(
  chat: Chat,
  options: Partial<ExportOptions> = {}
): string {
  const {
    includeTimestamps = true,
    includeAttachments = true,
    includeMetadata = true,
    operatorLabel = "OPERATOR",
    assistantLabel = "AETHER INTELLIGENCE",
  } = options;

  const divider = "=".repeat(78);
  const subDivider = "-".repeat(78);
  const lines: string[] = [];

  lines.push(divider);
  lines.push("AETHER AI — CONVERSATION HISTORY EXPORT");
  lines.push(divider);
  lines.push(`Title          : ${chat.title || "Neural Session"}`);

  if (includeMetadata) {
    lines.push(`Exported On    : ${formatExportDate(new Date())}`);
    lines.push(`Created On     : ${formatExportDate(chat.createdAt)}`);
    if (chat.updatedAt) {
      lines.push(`Last Updated   : ${formatExportDate(chat.updatedAt)}`);
    }
    lines.push(`Total Messages : ${chat.messages.length}`);
  }
  lines.push(divider);
  lines.push("");

  if (chat.messages.length === 0) {
    lines.push("[No messages in this session]");
    return lines.join("\n");
  }

  chat.messages.forEach((msg, index) => {
    const isUser = msg.role === "user";
    const sender = isUser ? `[${operatorLabel.toUpperCase()}]` : `[${assistantLabel.toUpperCase()}]`;
    const timeStr = includeTimestamps ? ` - ${formatExportDate(msg.timestamp)}` : "";

    lines.push(`${sender}${timeStr}`);
    lines.push("");
    lines.push(msg.content || "(No content)");
    lines.push("");

    if (includeAttachments && msg.attachments && msg.attachments.length > 0) {
      lines.push("Attached Files:");
      msg.attachments.forEach((att: Attachment) => {
        lines.push(`  * ${att.name} [${att.type || "file"}, ${formatFileSize(att.size)}]`);
      });
      lines.push("");
    }

    if (msg.images && msg.images.length > 0) {
      lines.push("Generated Images:");
      msg.images.forEach((img, imgIdx) => {
        lines.push(`  * Image ${imgIdx + 1}: "${img.prompt || "Visual"}"`);
      });
      lines.push("");
    }

    if (index < chat.messages.length - 1) {
      lines.push(subDivider);
      lines.push("");
    }
  });

  lines.push(divider);
  lines.push("END OF CONVERSATION RECORD");
  lines.push(divider);

  return lines.join("\n");
}

/**
 * Triggers a browser download of a given string payload
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Downloads chat as Markdown (.md)
 */
export function downloadChatAsMarkdown(chat: Chat, options: Partial<ExportOptions> = {}): void {
  const content = generateMarkdownExport(chat, options);
  const dateStr = new Date().toISOString().split("T")[0];
  const safeName = sanitizeFilename(chat.title);
  const filename = `${safeName}-${dateStr}.md`;
  downloadFile(content, filename, "text/markdown");
}

/**
 * Downloads chat as Text (.txt)
 */
export function downloadChatAsText(chat: Chat, options: Partial<ExportOptions> = {}): void {
  const content = generatePlainTextExport(chat, options);
  const dateStr = new Date().toISOString().split("T")[0];
  const safeName = sanitizeFilename(chat.title);
  const filename = `${safeName}-${dateStr}.txt`;
  downloadFile(content, filename, "text/plain");
}

/**
 * Copy string to user clipboard safely
 */
export async function copyExportToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older contexts
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    return false;
  }
}
