import { useRef, useState } from "react";
import { Upload, X, FileText, Image as ImageIcon, File } from "lucide-react";
import { Attachment } from "../lib/types";

interface Props {
  onFilesReady: (files: Attachment[]) => void;
  files: Attachment[];
  onRemove: (index: number) => void;
  onClearAll?: () => void;
  onClose?: () => void;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const ACCEPTED = [
  "image/png", "image/jpeg", "image/webp", "image/gif",
  "application/pdf",
  "text/plain", "text/csv", "text/markdown",
  "application/json",
];

export default function FileUploadZone({ 
  onFilesReady, 
  files, 
  onRemove,
  onClearAll,
  onClose,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFiles = async (fileList: FileList) => {
    const newAttachments: Attachment[] = [];
    for (const file of Array.from(fileList)) {
      if (!ACCEPTED.includes(file.type)) continue;
      if (file.size > MAX_SIZE) continue;
      const base64 = await toBase64(file);
      newAttachments.push({
        name: file.name,
        type: file.type,
        size: file.size,
        base64,
        mimeType: file.type,
      });
    }
    if (newAttachments.length) onFilesReady(newAttachments);
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // strip data: prefix
      };
      reader.readAsDataURL(file);
    });

  const getIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon size={14} className="text-emerald-400" />;
    if (type === "application/pdf") return <FileText size={14} className="text-rose-400" />;
    return <File size={14} className="text-cyan-400" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="w-full bg-surface/80 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      {/* Top Header with title, count, and Cancel/Close button */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">Attach Documents & Images</span>
          {files.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
              {files.length} ready
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {files.length > 0 && onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-[10px] font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
              title="Don't add any files - clear all"
            >
              <X size={12} />
              <span>Clear All</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:text-white hover:bg-white/10 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
              title="Close attachment area"
            >
              <X size={12} />
              <span>Close</span>
            </button>
          )}
        </div>
      </div>

      {/* Drag and drop button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          processFiles(e.dataTransfer.files);
        }}
        className={`flex items-center justify-center gap-3 w-full py-5 rounded-xl text-xs transition-all duration-300 border-2 border-dashed
          ${dragging 
            ? "border-emerald-400 bg-emerald-500/10 text-white shadow-lg" 
            : "border-white/15 bg-white/[0.03] text-text-secondary hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
          }`}
      >
        <Upload size={16} className={dragging ? "text-emerald-400 animate-bounce" : "text-white/70"} />
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
          <span className="font-semibold text-white">
            {dragging ? "Drop files to attach" : "Click or drag files here"}
          </span>
          <span className="text-[10px] text-text-secondary font-mono">
            (PDF, PNG, JPG, WEBP, TXT, JSON · up to 10MB)
          </span>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED.join(",")}
        className="hidden"
        onClick={(e) => {
          // Reset value so selecting the same file triggers onChange
          (e.target as HTMLInputElement).value = "";
        }}
        onChange={(e) => e.target.files && processFiles(e.target.files)}
      />

      {/* Files List with prominent Remove / Don't Add buttons */}
      {files.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-2">
            <span>Staged Files ({files.length}):</span>
            <span className="text-white/40 normal-case">Click &quot;X&quot; if you don&apos;t want to add a file</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div 
                key={`${f.name}-${f.size}-${i}`} 
                className="group flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-xl text-xs bg-black/40 border border-white/10 text-text-primary hover:border-white/20 transition-all animate-in fade-in"
              >
                {/* Optional thumbnail preview for images */}
                {f.type.startsWith("image/") && f.base64 ? (
                  <img
                    src={`data:${f.mimeType || f.type};base64,${f.base64}`}
                    alt={f.name}
                    className="w-5 h-5 rounded object-cover border border-white/10"
                  />
                ) : (
                  <span>{getIcon(f.type)}</span>
                )}

                <span className="max-w-[130px] truncate font-medium text-white text-[11px]" title={f.name}>
                  {f.name}
                </span>
                
                <span className="text-text-secondary font-mono text-[10px]">
                  {formatSize(f.size)}
                </span>

                {/* Explicit remove button */}
                <button 
                  type="button"
                  onClick={() => onRemove(i)} 
                  className="p-1 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/60 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-all ml-1"
                  title={`Don't add this file: remove ${f.name}`}
                  aria-label={`Don't add file ${f.name}`}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
