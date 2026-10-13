import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Severity } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function isValidUrl(urlString: string): boolean {
  if (!urlString) return false;
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getSeverityBadgeClasses(severity: Severity): {
  badge: string;
  dot: string;
  label: string;
} {
  switch (severity) {
    case "critical":
      return {
        badge: "bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]",
        dot: "bg-[#991B1B]",
        label: "Critical",
      };
    case "high":
      return {
        badge: "bg-[#FFEDD5] text-[#C2410C] border-[#FDBA74]",
        dot: "bg-[#C2410C]",
        label: "High",
      };
    case "medium":
      return {
        badge: "bg-[#FEF3C7] text-[#B45309] border-[#FCD34D]",
        dot: "bg-[#B45309]",
        label: "Medium",
      };
    case "low":
      return {
        badge: "bg-[#DBEAFE] text-[#1D4ED8] border-[#93C5FD]",
        dot: "bg-[#1D4ED8]",
        label: "Low",
      };
  }
}

export function getCurrentTimestamp(): string {
  const now = new Date();
  return now.toTimeString().split(" ")[0];
}

