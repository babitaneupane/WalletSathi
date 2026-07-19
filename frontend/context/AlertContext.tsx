"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

type AlertType = "info" | "success" | "error";

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("info");

  const showAlert = (message: string, type: AlertType = "info") => {
    setAlertMessage(message);
    setAlertType(type);
    setIsOpen(true);
  };

  const closeAlert = () => {
    setIsOpen(false);
    setTimeout(() => {
      setAlertMessage("");
    }, 300);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} onClick={(e) => e.target === e.currentTarget && closeAlert()}>
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1E293B] p-6 shadow-2xl transform transition-all duration-200" style={{ animation: "fadeIn 0.2s ease-out" }}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                  alertType === 'error' ? 'bg-red-500/10' : 
                  alertType === 'success' ? 'bg-emerald-500/10' : 
                  'bg-cyan-500/10'
                }`}>
                  {alertType === 'error' && <AlertCircle className="h-5 w-5 text-red-400" />}
                  {alertType === 'success' && <CheckCircle className="h-5 w-5 text-emerald-400" />}
                  {alertType === 'info' && <Info className="h-5 w-5 text-cyan-400" />}
                </div>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
                  {alertType === 'error' ? 'Error' : alertType === 'success' ? 'Success' : 'Notification'}
                </h2>
              </div>
              <button onClick={closeAlert} className="text-slate-500 hover:text-slate-300 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-300 mb-6">{alertMessage}</p>
            <div className="flex justify-end">
              <button type="button" onClick={closeAlert}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition ${
                  alertType === 'error' ? 'bg-red-500 hover:bg-red-400 shadow-red-500/20' : 
                  alertType === 'success' ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20' : 
                  'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/20 text-slate-900'
                }`}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}
