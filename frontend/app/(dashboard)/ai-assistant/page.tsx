"use client";

import { useState } from "react";
import { Send, Mic, Paperclip, Sparkles, TrendingUp, AlertTriangle, ShieldCheck, BarChart3, Loader2 } from "lucide-react";
import api from "../../../lib/api";

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "user",
      content: "Can you analyze my spending for the last 30 days and suggest where I can cut back to save for my upcoming Europe trip?",
      timestamp: "10:24 AM"
    },
    {
      id: 2,
      role: "assistant",
      content: "Based on your last 30 days of transaction data, here is your spending analysis:\n\n• **Dining Out:** You spent €420, which is 25% higher than your 6-month average. Cutting this by half would save you €210.\n• **Subscriptions:** You have 3 overlapping streaming services. Canceling two could save you €35/month.\n• **Transport:** Your ride-sharing costs spiked last week. Switching to public transit for weekend trips could save ~€60/month.\n\nTotal potential savings for your Europe trip: **€305/month**.",
      timestamp: "10:25 AM"
    }
  ]);
  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    const newUserMsg = {
      id: Date.now(),
      role: "user",
      content: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInput("");
    setLoading(true);
    
    try {
      const res = await api.post("/ai/chat", { message: userMessage });
      // Map backend history to our UI format
      const formattedHistory = res.data.history.map((msg: any, index: number) => ({
        id: Date.now() + index,
        role: msg.role,
        content: msg.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setMessages(formattedHistory);
    } catch (err) {
      console.error("Chat error", err);
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        content: "Sorry, I encountered an error connecting to the AI brain.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col justify-center border-b border-white/5 pb-4 mb-6 shrink-0">
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-outfit)" }}>AI Assistant</h1>
        <p className="text-sm text-slate-400">Ask questions about your finances, generate reports, and get personalized insights.</p>
      </div>

      <div className="flex-1 grid lg:grid-cols-3 gap-8 min-h-0">
        {/* Left Column (Chat Interface) */}
        <div className="lg:col-span-2 flex flex-col rounded-3xl border border-white/5 bg-[#1E293B] shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 h-[500px] w-[500px] bg-cyan-500/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none"></div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 scrollbar-hide">
            <div className="flex justify-center my-6">
              <span className="text-[10px] font-bold px-3 py-1 bg-[#0F172A] text-slate-500 rounded-full uppercase tracking-widest border border-white/5">
                August 24th, 2024
              </span>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === "user" 
                    ? "bg-cyan-500 text-slate-900 rounded-tr-sm" 
                    : "bg-[#0F172A] border border-white/5 text-slate-200 rounded-tl-sm"
                }`}>
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2 text-cyan-400">
                      <img src="/logo.png" alt="Logo" className="h-4 w-4 object-contain" />
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
          </div>

          <div className="p-6 bg-[#1E293B] border-t border-white/5 relative z-10 shrink-0">
            <form onSubmit={handleSend} className="relative flex items-center">
              <button type="button" className="absolute left-4 text-slate-400 hover:text-white transition">
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask a question about your finances..."
                className="w-full rounded-full border border-white/10 bg-[#0F172A] py-4 pl-12 pr-24 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition shadow-inner"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button type="button" className="p-2 text-slate-400 hover:text-white transition rounded-full hover:bg-white/5">
                  <Mic className="h-5 w-5" />
                </button>
                <button type="submit" disabled={!input.trim() || loading} className="p-2 bg-cyan-500 text-slate-900 rounded-full hover:bg-cyan-400 transition disabled:opacity-50 disabled:bg-slate-600 flex items-center justify-center">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin ml-0.5" /> : <Send className="h-4 w-4 ml-0.5" />}
                </button>
              </div>
            </form>
            <p className="text-center text-[10px] text-slate-500 mt-3 font-medium">WalletSathi AI can make mistakes. Consider verifying important financial decisions.</p>
          </div>
        </div>

        {/* Right Column (Live Insights) */}
        <div className="space-y-6 overflow-y-auto pr-2 scrollbar-hide hidden lg:block">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Live Insights</h3>
          </div>

          {/* Alert Card */}
          <div className="rounded-2xl border border-rose-500/20 bg-[#1E293B] p-5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-24 w-24 bg-rose-500/10 rounded-full blur-xl -mr-10 -mt-10 transition group-hover:bg-rose-500/20"></div>
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="h-8 w-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
              </div>
              <h4 className="font-bold text-white text-sm">Budget Alert</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4 relative z-10">
              Your <strong className="text-white">Travel</strong> budget is at 85% capacity with 12 days left in the month.
            </p>
            <button className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition relative z-10 flex items-center gap-1">
              Review Transactions &rarr;
            </button>
          </div>

          {/* Opportunity Card */}
          <div className="rounded-2xl border border-emerald-500/20 bg-[#1E293B] p-5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-24 w-24 bg-emerald-500/10 rounded-full blur-xl -mr-10 -mt-10 transition group-hover:bg-emerald-500/20"></div>
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <h4 className="font-bold text-white text-sm">Opportunity</h4>
            </div>
            <h5 className="font-bold text-emerald-400 text-xs uppercase tracking-widest mb-1 relative z-10">Tax Optimization</h5>
            <p className="text-xs text-slate-400 leading-relaxed relative z-10">
              Transferring <strong className="text-white">€2,000</strong> to your 401(k) before year-end will maximize your employer match and reduce your taxable bracket.
            </p>
          </div>

          {/* Chart Widget */}
          <div className="rounded-2xl border border-white/5 bg-[#1E293B] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-cyan-400" />
                <h4 className="font-bold text-white text-sm">Cash Flow Projection</h4>
              </div>
            </div>
            <div className="h-32 flex items-end gap-2 pt-4">
              {/* Mock Bar Chart */}
              {[40, 70, 45, 90, 60, 85].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="w-full bg-[#0F172A] rounded-t-sm relative">
                    <div 
                      className={`w-full rounded-t-sm transition-all duration-500 ${i === 3 ? "bg-cyan-500" : "bg-cyan-500/20 group-hover:bg-cyan-500/40"}`} 
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">W{i+1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
