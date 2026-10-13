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
        let icon = <Info className="w-5 h-5 text-[#2563EB] shrink-0" />;
        let borderColor = "border-[#D9E2F0]";
        let bgColor = "bg-white";

        if (toast.type === "success") {
          icon = <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />;
          borderColor = "border-[#BBF7D0]";
          bgColor = "bg-[#F0FDF4]";
        } else if (toast.type === "error") {
          icon = <XCircle className="w-5 h-5 text-[#991B1B] shrink-0" />;
          borderColor = "border-[#FCA5A5]";
          bgColor = "bg-[#FEE2E2]";
        } else if (toast.type === "warning") {
          icon = <AlertCircle className="w-5 h-5 text-[#B45309] shrink-0" />;
          borderColor = "border-[#FCD34D]";
          bgColor = "bg-[#FEF3C7]";
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-card border ${borderColor} ${bgColor} shadow-card text-[#0B1F3A]`}
          >
            {icon}
            <div className="flex-1 text-sm">
              {toast.title && (
                <p className="font-semibold text-xs tracking-wide uppercase mb-0.5 text-[#0B1F3A]">
                  {toast.title}
                </p>
              )}
              <p className="text-xs leading-relaxed text-[#51627A]">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#51627A] hover:text-[#0B1F3A] p-1 rounded hover:bg-black/5"
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

