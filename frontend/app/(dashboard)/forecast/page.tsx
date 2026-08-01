"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Sparkles, BrainCircuit, AlertCircle } from "lucide-react";
import api from "../../../lib/api";

interface ForecastData {
  projectedIncome: number;
  projectedExpense: number;
  explanation: string;
}

export default function ForecastPage() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await api.get("/ai/forecast");
        setData(res.data);
      } catch (err: any) {
        console.error("Failed to fetch forecast", err);
        setError("Could not generate forecast at this time.");
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, []);

  return (
    <div className="flex-1 p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-emerald-500" />
          AI Forecast
        </h1>
        <p className="text-slate-500 mt-2">
          Your projected income and expenses for the upcoming month, powered by AI.
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center p-20 border border-slate-200/60 rounded-3xl bg-slate-50/50">
          <div className="relative">
            <div className="absolute inset-0 blur-xl bg-emerald-500/20 rounded-full animate-pulse"></div>
            <Sparkles className="h-12 w-12 text-emerald-500 animate-bounce relative z-10" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mt-6">Analyzing your transactions...</h3>
          <p className="text-sm text-slate-500 mt-1">Our AI is crunching the numbers from the last 30 days.</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {data && !loading && !error && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <TrendingUp className="h-24 w-24 text-emerald-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h2 className="font-semibold text-slate-600">Projected Income</h2>
                </div>
                <div className="text-4xl font-bold text-slate-900 tracking-tight">
                  NPR {data.projectedIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Expense Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <TrendingDown className="h-24 w-24 text-red-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-red-50 rounded-xl">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="font-semibold text-slate-600">Projected Expenses</h2>
                </div>
                <div className="text-4xl font-bold text-slate-900 tracking-tight">
                  NPR {data.projectedExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Explanation Section */}
          <div className="bg-gradient-to-br from-emerald-500/5 to-purple-600/5 border border-emerald-500/20 rounded-3xl p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-emerald-100">
                <Sparkles className="h-5 w-5 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">AI Analysis</h2>
            </div>
            <div className="prose prose-slate prose-p:leading-relaxed max-w-none text-slate-700 font-medium">
              <p>{data.explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
