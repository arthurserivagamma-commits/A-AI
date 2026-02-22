import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Share2, Upload, Edit3, ExternalLink } from "lucide-react";
import { cn } from "../lib/utils";

interface CodeBlockProps {
  code: string;
  language: string;
  onEdit?: (code: string) => void;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, onEdit }) => {
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(window.location.origin + publishedUrl);
      alert("Link copied to clipboard!");
    } else {
      alert("Publish the code first to get a shareable link!");
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      // Extract title from <title> tag if HTML
      let title = "Untitled Snippet";
      if (language === "html" || code.includes("<html")) {
        const titleMatch = code.match(/<title>(.*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1];
        }
      }

      const id = Math.random().toString(36).substring(2, 10);
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, code, language }),
      });

      const data = await response.json();
      if (data.success) {
        setPublishedUrl(data.url);
      }
    } catch (error) {
      console.error("Publish error:", error);
      alert("Failed to publish code.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="relative group my-6 rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0d0d0d] shadow-2xl transition-all hover:border-white/20">
      <div className="flex items-center justify-between px-5 py-3 bg-white/[0.03] border-b border-white/[0.08] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
          </div>
          <span className="text-[10px] font-bold font-mono text-white/30 uppercase tracking-[0.15em] ml-2">{language}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white active:scale-90"
            title="Copy code"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
          <button
            onClick={() => onEdit?.(code)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white active:scale-90"
            title="Edit code"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white active:scale-90"
            title="Share code"
          >
            <Share2 size={14} />
          </button>
          <div className="w-[1px] h-4 bg-white/10 mx-1" />
          <button
            onClick={handlePublish}
            disabled={publishing || !!publishedUrl}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95",
              publishedUrl 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
            )}
          >
            {publishing ? (
              <span className="animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full" />
            ) : publishedUrl ? (
              <>
                <ExternalLink size={12} />
                PUBLISHED
              </>
            ) : (
              <>
                <Upload size={12} />
                PUBLISH
              </>
            )}
          </button>
        </div>
      </div>

      {publishedUrl && (
        <div className="px-5 py-2.5 bg-emerald-500/[0.03] border-b border-emerald-500/10 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[10px] text-emerald-400/70 font-mono truncate tracking-tight">
              {window.location.origin}{publishedUrl}
            </span>
          </div>
          <a 
            href={publishedUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 shrink-0 transition-colors"
          >
            OPEN IN A-AI <ExternalLink size={10} />
          </a>
        </div>
      )}

      <div className="max-h-[600px] overflow-auto custom-scrollbar">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1.5rem",
            fontSize: "13px",
            lineHeight: "1.6",
            background: "transparent",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
