"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Mic, Paperclip, Sparkles, AlertTriangle, BarChart3, Loader2, MessageSquare } from "lucide-react";
import api from "../../../lib/api";

interface Message {
  id: number;
  role: string;
  content: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  "How much have I spent this month?",
  "What's my biggest expense category?",
  "Show me my income vs expenses",
  "Where can I cut back to save more?",
  "What are my recent transactions?",
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing chat history from backend on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        // We send a lightweight dummy fetch — actually we call getInsights to warm up,
        // but history is returned with /ai/chat. So we just start fresh but load from localStorage cache.
        setHistoryLoading(false);
      } catch {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent | null, overrideMessage?: string) => {
    if (e) e.preventDefault();
    const userMessage = (overrideMessage || input).trim();
    if (!userMessage) return;

    const newUserMsg: Message = {
      id: Date.now(),
      role: "user",
      content: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", { message: userMessage });
      const formattedHistory: Message[] = res.data.history.map((msg: any, index: number) => ({
        id: index + 1,
        role: msg.role,
        content: msg.message,
        timestamp: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
      setMessages(formattedHistory);
    } catch (err) {
      console.error("Chat error", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          content: "Sorry, I encountered an error connecting to the AI. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (question: string) => {
    handleSend(null, question);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col justify-center border-b border-slate-200 pb-4 mb-6 shrink-0">
        <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
          AI Assistant
        </h1>
        <p className="text-sm text-slate-500">
          Ask questions about your finances, generate reports, and get personalized insights.
        </p>
      </div>

      <div className="flex-1 grid lg:grid-cols-3 gap-8 min-h-0">
        {/* Left Column — Chat Interface */}
        <div className="lg:col-span-2 flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 h-[500px] w-[500px] bg-emerald-500/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none" />

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 scrollbar-hide">
            {historyLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              /* Empty state — welcome screen */
              <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4">
                <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Sparkles className="h-10 w-10 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Ask me about your finances</h2>
                  <p className="text-sm text-slate-500 max-w-sm">
                    I have access to all your transactions and can help you understand your spending, find savings, and more.
                  </p>
                </div>

                {/* Suggested Questions */}
                <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSuggestion(q)}
                      disabled={loading}
                      className="text-left text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-500/40 hover:text-slate-900 hover:bg-emerald-500/5 transition-all duration-200 flex items-center gap-3"
                    >
                      <MessageSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center my-2">
                  <span className="text-[10px] font-bold px-3 py-1 bg-slate-50 text-slate-500 rounded-full uppercase tracking-widest border border-slate-200">
                    {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${msg.role === "user"
                        ? "bg-emerald-500 text-slate-900 rounded-tr-sm"
                        : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm"
                        }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-2 text-emerald-500">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase tracking-widest">WalletSathi AI</span>
                        </div>
                      )}
                      <div className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "font-medium" : ""}`}>
                        {msg.content}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 mt-2 mx-1">{msg.timestamp}</span>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-start">
                    <div className="max-w-[80%] rounded-2xl rounded-tl-sm p-4 bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2 text-emerald-500">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">WalletSathi AI</span>
                      </div>
                      <div className="flex gap-1 items-center h-5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-slate-200 relative z-10 shrink-0">
            <form onSubmit={handleSend} className="relative flex items-center">
              <button type="button" className="absolute left-4 text-slate-500 hover:text-slate-900 transition">
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your finances..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-4 pl-12 pr-24 text-sm text-slate-900 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition shadow-inner"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button type="button" className="p-2 text-slate-500 hover:text-slate-900 transition rounded-full hover:bg-slate-50">
                  <Mic className="h-5 w-5" />
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2 bg-emerald-500 text-slate-900 rounded-full hover:bg-emerald-500 transition disabled:opacity-50 disabled:bg-slate-600 flex items-center justify-center"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin ml-0.5" /> : <Send className="h-4 w-4 ml-0.5" />}
                </button>
              </div>
            </form>
            <p className="text-center text-[10px] text-slate-500 mt-3 font-medium">
              WalletSathi AI uses your real transaction data. Verify important financial decisions independently.
            </p>
          </div>
        </div>

        {/* Right Column — Live Insights Panel */}
        <div className="space-y-6 overflow-y-auto pr-2 scrollbar-hide hidden lg:block">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Quick Actions</h3>
          </div>

          {/* Suggested prompts panel */}
          <div className="rounded-2xl border border-emerald-500/20 bg-white p-5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-24 w-24 bg-emerald-500/10 rounded-full blur-xl -mr-10 -mt-10 transition group-hover:bg-emerald-500/20" />
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-emerald-500" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Try Asking</h4>
            </div>
            <div className="space-y-2 relative z-10">
              {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestion(q)}
                  disabled={loading}
                  className="block w-full text-left text-xs text-slate-500 hover:text-emerald-500 transition py-1 border-b border-slate-200 last:border-0"
                >
                  → {q}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Alert Card */}
          <div className="rounded-2xl border border-rose-500/20 bg-white p-5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-24 w-24 bg-rose-500/10 rounded-full blur-xl -mr-10 -mt-10 transition group-hover:bg-rose-500/20" />
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="h-8 w-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Tip</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4 relative z-10">
              Ask the AI about <strong className="text-slate-900">specific date ranges</strong> like &quot;How much did I spend last week?&quot; for precise analysis.
            </p>
          </div>

          {/* Cash Flow Widget */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                <h4 className="font-bold text-slate-900 text-sm">Cash Flow Projection</h4>
              </div>
            </div>
            <div className="h-35 flex items-end gap-2 pt-1">
              {[25, 70, 30, 90, 60, 80].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="w-full bg-slate-50 rounded-t-sm relative" style={{ height: "128px" }}>
                    <div
                      className={`w-full rounded-t-sm transition-all duration-500 absolute bottom-0 ${i === 3 ? "bg-emerald-500" : "bg-emerald-500/20 group-hover:bg-emerald-500/40"
                        }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">W{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
