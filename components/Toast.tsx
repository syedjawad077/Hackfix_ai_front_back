"use client";

import React from "react";
import { ToastMessage } from "@/lib/types";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-[var(--ink-soft)] shrink-0" />;
        let borderColor = "border-[var(--line)]";
        let bgColor = "bg-[var(--paper)]";

        if (toast.type === "success") {
          icon = <CheckCircle2 className="w-5 h-5 text-[#4C9F70] shrink-0" />;
          borderColor = "border-[#BDE3CC]";
          bgColor = "bg-[#EDF7F1]";
        } else if (toast.type === "error") {
          icon = <XCircle className="w-5 h-5 text-[#D7263D] shrink-0" />;
          borderColor = "border-[#F8B4BB]";
          bgColor = "bg-[#FDE8EA]";
        } else if (toast.type === "warning") {
          icon = <AlertCircle className="w-5 h-5 text-[#F2A900] shrink-0" />;
          borderColor = "border-[#FBE39F]";
          bgColor = "bg-[#FEF8E7]";
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-[8px] border ${borderColor} ${bgColor} text-[var(--ink)]`}
          >
            {icon}
            <div className="flex-1 text-sm">
              {toast.title && (
                <p className="font-semibold text-xs tracking-wide uppercase mb-0.5 text-[var(--ink)]">
                  {toast.title}
                </p>
              )}
              <p className="text-xs leading-relaxed text-[var(--ink-soft)]">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[var(--ink-soft)] hover:text-[var(--ink)] p-1 rounded-[8px]"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

