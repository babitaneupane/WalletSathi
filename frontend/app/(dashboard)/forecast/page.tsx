"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Sparkles, BrainCircuit, AlertCircle, Lightbulb, TriangleAlert, Info } from "lucide-react";
import api from "../../../lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface TrendData {
  month: string;
  income: number;
  expense: number;
}

interface CategoryPrediction {
  category: string;
  amount: number;
}

interface ForecastData {
  projectedIncome: number;
  projectedExpense: number;
  explanation: string;
  trendData: TrendData[];
  categoryPredictions: CategoryPrediction[];
  actionableSteps: string[];
  warnings: string[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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

          {/* Warnings Section */}
          {data.warnings && data.warnings.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
                <TriangleAlert className="h-5 w-5" />
                <h3>Important Warnings</h3>
              </div>
              <ul className="space-y-2">
                {data.warnings.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-red-600 text-sm font-medium">
                    <span className="mt-1">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actionable Steps */}
          {data.actionableSteps && data.actionableSteps.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-blue-700 font-bold mb-2">
                <Lightbulb className="h-5 w-5" />
                <h3>Actionable Recommendations</h3>
              </div>
              <ul className="space-y-3">
                {data.actionableSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-blue-100 shadow-sm text-blue-900 text-sm font-medium">
                    <span className="bg-blue-100 text-blue-700 font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">{idx + 1}</span>
                    <span className="mt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 6-Month Trend Chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800">6-Month Trend Forecast</h3>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-emerald-600"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Income</div>
                  <div className="flex items-center gap-1.5 text-red-600"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Expense</div>
                </div>
              </div>
              
              {data.trendData && data.trendData.length > 0 ? (
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `NPR ${val / 1000}k`} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => `NPR ${Number(value).toLocaleString()}`}
                      />
                      <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                  No trend data available
                </div>
              )}
            </div>

            {/* Category Predictions */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
              <h3 className="font-bold text-slate-800 mb-6">Predicted Expenses</h3>
              
              {data.categoryPredictions && data.categoryPredictions.length > 0 ? (
                <>
                  <div className="h-[200px] w-full mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.categoryPredictions}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="amount"
                          nameKey="category"
                        >
                          {data.categoryPredictions.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value: any) => `NPR ${Number(value).toLocaleString()}`}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {data.categoryPredictions.map((cat, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 font-medium text-slate-700">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                          {cat.category}
                        </div>
                        <div className="font-bold text-slate-900">
                          NPR {cat.amount.toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                  No category data available
                </div>
              )}
            </div>
          </div>

          {/* Explanation Section */}
          <div className="bg-gradient-to-br from-emerald-500/5 to-purple-600/5 border border-emerald-500/20 rounded-3xl p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-emerald-100">
                <Sparkles className="h-5 w-5 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">AI Summary</h2>
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
