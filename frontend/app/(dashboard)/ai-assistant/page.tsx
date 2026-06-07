"use client";

import { useState, useRef, useEffect } from "react";
import { BrainCircuit, Send, User } from "lucide-react";
import api from "../../../lib/api";

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<{ role: string; message: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", message: userMessage }]);
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", { message: userMessage });
      setMessages(res.data.history);
    } catch (err) {
      console.error("Chat error", err);
      setMessages((prev) => [...prev, { role: "assistant", message: "Sorry, I encountered an error. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] glass rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl mx-auto">
      <div className="bg-white/80 border-b border-slate-200 p-4 flex items-center gap-3">
        <div className="p-2 bg-primary/10 text-primary rounded-xl">
          <BrainCircuit className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900">FinFlow AI Assistant</h2>
          <div className="flex items-center gap-1.5 text-xs text-success font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            SYSTEM ONLINE
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <BrainCircuit className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">How can I help you today?</h3>
            <p className="text-slate-500 max-w-md">
              I can analyze your spending habits, forecast your monthly budget, or find specific transactions across all your linked accounts.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
              <button onClick={() => setInput("How much did I spend on food last month?")} className="p-4 rounded-xl border border-slate-200 bg-white text-left text-sm font-medium text-slate-700 hover:border-primary hover:shadow-md transition">
                <span className="block text-primary mb-2 text-lg">🍔</span>
                How much did I spend on food last month?
              </button>
              <button onClick={() => setInput("Analyze my subscription costs")} className="p-4 rounded-xl border border-slate-200 bg-white text-left text-sm font-medium text-slate-700 hover:border-primary hover:shadow-md transition">
                <span className="block text-success mb-2 text-lg">💳</span>
                Analyze my subscription costs
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-1">
                  <BrainCircuit className="h-4 w-4" />
                </div>
              )}
              <div className={`px-5 py-3.5 max-w-[80%] rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-sm' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
              </div>
              {msg.role === 'user' && (
                <div className="h-8 w-8 shrink-0 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-4 justify-start">
            <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-1">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <div className="px-5 py-4 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
              <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white/50 border-t border-slate-200">
        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask FinFlow AI anything..."
            className="w-full rounded-full border border-slate-300 bg-white py-3.5 pl-6 pr-12 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-hover transition disabled:opacity-50 disabled:hover:bg-primary"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-3">
          FinFlow AI can make mistakes. Check important financial info.
        </p>
      </div>
    </div>
  );
}
