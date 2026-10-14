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

export function normalizeUrl(urlString: string): string {
  const trimmed = (urlString || "").trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function isValidUrl(urlString: string): boolean {
  if (!urlString) return false;
  try {
    const formatted = normalizeUrl(urlString);
    const url = new URL(formatted);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname && url.hostname.includes("."));
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
        badge: "bg-[#FDE8EA] text-[#D7263D] border-[#F8B4BD]",
        dot: "bg-[#D7263D]",
        label: "Critical",
      };
    case "high":
      return {
        badge: "bg-[#FDEEE7] text-[#E8591A] border-[#F8C8B3]",
        dot: "bg-[#E8591A]",
        label: "High",
      };
    case "medium":
      return {
        badge: "bg-[#FEF7E6] text-[#8A6000] border-[#FBDFA0]",
        dot: "bg-[#F2A900]",
        label: "Medium",
      };
    case "low":
      return {
        badge: "bg-[#EDF7F1] text-[#2E734D] border-[#BFE4CE]",
        dot: "bg-[#4C9F70]",
        label: "Low",
      };
  }
}


export function getCurrentTimestamp(): string {
  const now = new Date();
  return now.toTimeString().split(" ")[0];
}

