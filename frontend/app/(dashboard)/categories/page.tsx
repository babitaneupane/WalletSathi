"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Wallet, ShoppingCart, Utensils, Car, Home, Plane, MonitorPlay, Coffee, Dumbbell, Shield, GraduationCap, BriefcaseMedical, X, AlertTriangle } from "lucide-react";
import api from "../../../lib/api";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  userId: string | null;
}

const ICON_MAP: Record<string, any> = {
  "Real Estate": Home,
  "Travel": Plane,
  "Subscriptions": MonitorPlay,
  "Lifestyle": Coffee,
  "Health": Dumbbell,
  "Security": Shield,
  "Education": GraduationCap,
  "Insurance": BriefcaseMedical,
};

const AVAILABLE_ICONS: Record<string, any> = {
  Wallet,
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Plane,
  MonitorPlay,
  Coffee,
  Dumbbell,
  Shield,
  GraduationCap,
  BriefcaseMedical
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Wallet");
  const [isAdding, setIsAdding] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      setIsAdding(true);
      const res = await api.post("/categories", { name: newCategoryName, icon: selectedIcon });
      setCategories([...categories, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName("");
    } catch (error) {
      console.error("Failed to add category", error);
    } finally {
      setIsAdding(false);
    }
  };

  const confirmDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/categories/${categoryToDelete.id}`);
      setCategories(categories.filter((c) => c.id !== categoryToDelete.id));
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      setDeleteError(error.response?.data?.message || "Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl p-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
          Category Management
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Organize your financial ecosystem. Custom categories help track your specific spending habits.
        </p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#1A1333] p-6 shadow-xl">
        <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex-1">
            <label className="text-xs font-semibold text-indigo-400 mb-2 block">Category Name</label>
            <input
              type="text"
              placeholder="e.g. Cloud Infrastructure"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-[#0F0B1E] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition shadow-inner"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-indigo-400 mb-2 block">Select Icon</label>
            <div className="flex gap-2">
              {[
                { id: "Wallet", Icon: Wallet },
                { id: "ShoppingCart", Icon: ShoppingCart },
                { id: "Utensils", Icon: Utensils },
                { id: "Car", Icon: Car },
              ].map((ic) => (
                <button
                  key={ic.id}
                  type="button"
                  onClick={() => setSelectedIcon(ic.id)}
                  className={`p-3 rounded-xl transition ${selectedIcon === ic.id ? "bg-white/10 text-white" : "bg-[#0F0B1E] text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-white/5"}`}
                >
                  <ic.Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={isAdding || !newCategoryName.trim()}
            className="rounded-xl bg-indigo-500 hover:bg-indigo-400 px-8 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 h-[46px]"
          >
            {isAdding ? "Adding..." : "Add Category"}
          </button>
        </form>
      </div>

      <div>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Active Categories</h2>
          <span className="text-xs font-medium text-slate-500">{categories.length} Categories Total</span>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-full bg-white/5" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => {
              const Icon = (category.icon && AVAILABLE_ICONS[category.icon]) ? AVAILABLE_ICONS[category.icon] : (ICON_MAP[category.name] || Wallet);
              return (
                <div
                  key={category.id}
                  className="group flex items-center justify-between rounded-full border border-white/5 bg-[#1A1333] px-5 py-3.5 transition hover:border-white/10 hover:bg-white/5 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200 truncate pr-2">{category.name}</h3>
                  </div>

                  {category.userId && (
                    <button
                      onClick={(e) => { e.stopPropagation(); confirmDelete(category); }}
                      className="rounded-full p-2 text-slate-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && !isDeleting && setDeleteModalOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1A1333] p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Delete Category?</h2>
              </div>
              <button 
                onClick={() => setDeleteModalOpen(false)} 
                disabled={isDeleting}
                className="text-slate-500 hover:text-slate-300 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to delete <strong className="text-white">{categoryToDelete?.name}</strong>? This action cannot be undone.
            </p>

            {deleteError && (
              <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setDeleteModalOpen(false)} 
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleDeleteCategory}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-red-500 hover:bg-red-400 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
