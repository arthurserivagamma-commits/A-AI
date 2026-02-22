import React, { useState, useRef, useEffect } from "react";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import ReactMarkdown from "react-markdown";
import { Send, Bot, User, Sparkles, Terminal } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import { cn } from "../lib/utils";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your AI coding assistant. How can I help you build something today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, { role: "user", content: userMessage }].map(m => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: "You are A-AI, an expert full-stack developer and coding assistant. Provide clear, concise, and high-quality code snippets. Always wrap code in appropriate markdown blocks with language identifiers. When writing HTML, include a <title> tag that describes the page content. Your goal is to help users build and publish functional web snippets.",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      const assistantContent = response.text || "Sorry, I couldn't generate a response.";
      setMessages(prev => [...prev, { role: "assistant", content: assistantContent }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Error: Failed to connect to the AI service." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-main text-white font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06] bg-black/40 backdrop-blur-2xl sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Terminal size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">A-AI</h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Neural Core Active</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4">
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-10 space-y-10 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-10">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ring-1 ring-inset",
                msg.role === "user" 
                  ? "bg-white/5 ring-white/10 text-white/70" 
                  : "bg-indigo-500/10 ring-indigo-500/20 text-indigo-400"
              )}>
                {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={cn(
                "max-w-[85%] space-y-2",
                msg.role === "user" ? "text-right" : "text-left"
              )}>
                <div className={cn(
                  "inline-block px-5 py-4 rounded-[24px] text-[15px] leading-relaxed shadow-xl",
                  msg.role === "user" 
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/10" 
                    : "bg-white/[0.03] border border-white/[0.08] text-white/90 rounded-tl-none backdrop-blur-sm"
                )}>
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <CodeBlock
                            code={String(children).replace(/\n$/, "")}
                            language={match[1]}
                            onEdit={(code) => setInput(code)}
                          />
                        ) : (
                          <code className={cn("bg-white/10 px-1.5 py-0.5 rounded-md text-indigo-300 font-mono text-xs", className)} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-5 animate-in fade-in duration-300">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20 flex items-center justify-center">
                <div className="loader-sm" />
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-[24px] rounded-tl-none px-6 py-4 flex items-center gap-3 backdrop-blur-sm">
                <span className="text-xs text-white/40 font-medium uppercase tracking-widest">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/[0.06] bg-black/60 backdrop-blur-3xl chat-input-shadow">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Describe what you want to build..."
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-2xl px-6 py-4 pr-14 text-[15px] focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all resize-none min-h-[60px] max-h-60 placeholder:text-white/20"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 bottom-3 p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
