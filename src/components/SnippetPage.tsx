import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ArrowLeft, Terminal, Calendar, Code2, Copy, Check, Play, Eye } from "lucide-react";
import { cn } from "../lib/utils";

interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  created_at: string;
}

export const SnippetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"code" | "run">("run"); // Default to run as requested

  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const response = await fetch(`/api/snippet/${id}`);
        if (response.ok) {
          const data = await response.json();
          setSnippet(data);
          // Set document title to snippet title
          document.title = data.title || "Code Snippet";
        }
      } catch (error) {
        console.error("Error fetching snippet:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSnippet();
  }, [id]);

  const handleCopy = async () => {
    if (snippet) {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center gap-8">
        <div className="loader" />
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-white/40 text-xs font-bold uppercase tracking-[0.3em]">Retrieving Snippet</h2>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white p-6">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-white/60 mb-8">Snippet not found or has been removed.</p>
        <Link 
          to="/" 
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Back to Assistant
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main text-white font-sans selection:bg-indigo-500/30">
      <header className="border-b border-white/[0.06] bg-black/40 backdrop-blur-2xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link 
              to="/" 
              className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-white/40 hover:text-white border border-transparent hover:border-white/10 active:scale-95"
              title="Back to Assistant"
            >
              <ArrowLeft size={22} />
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
                <Terminal size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white">{snippet.title}</h1>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1.5 text-[10px] text-white/30 uppercase tracking-[0.15em] font-bold">
                    <Code2 size={12} className="text-indigo-400" /> {snippet.language}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-white/10" />
                  <span className="flex items-center gap-1.5 text-[10px] text-white/30 uppercase tracking-[0.15em] font-bold">
                    <Calendar size={12} className="text-indigo-400" /> {new Date(snippet.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode("run")}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === "run" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-white/40 hover:text-white"
              )}
            >
              <Play size={14} />
              RUN
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === "code" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-white/40 hover:text-white"
              )}
            >
              <Eye size={14} />
              CODE
            </button>
          </div>
          <div className="h-6 w-[1px] bg-white/10 mx-2" />
          <button
            onClick={handleCopy}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm"
          >
            {copied ? (
              <>
                <Check size={18} className="text-emerald-400" />
                <span className="text-emerald-400">COPIED</span>
              </>
            ) : (
              <>
                <Copy size={18} className="text-white/40" />
                COPY CODE
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <div className="rounded-[32px] overflow-hidden border border-white/[0.08] bg-[#0d0d0d] shadow-2xl ring-1 ring-white/5 min-h-[600px] flex flex-col">
          {viewMode === "code" ? (
            <SyntaxHighlighter
              language={snippet.language}
              style={vscDarkPlus}
              showLineNumbers
              customStyle={{
                margin: 0,
                padding: "2.5rem",
                fontSize: "15px",
                lineHeight: "1.7",
                background: "transparent",
                fontFamily: "'JetBrains Mono', monospace",
                flex: 1,
              }}
            >
              {snippet.code}
            </SyntaxHighlighter>
          ) : (
            <iframe
              srcDoc={snippet.code}
              title="Preview"
              className="w-full flex-1 bg-white border-none"
              sandbox="allow-scripts allow-modals"
            />
          )}
        </div>
      </main>
      
      <footer className="max-w-6xl mx-auto p-10 text-center">
        <div className="h-[1px] w-12 bg-white/10 mx-auto mb-6" />
        <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">
          A-AI • SECURE SNIPPET STORAGE
        </p>
      </footer>
    </div>
  );
};
