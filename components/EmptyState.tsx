"use client";

import React from "react";
import { Shield, Sparkles } from "lucide-react";

interface EmptyStateProps {
  onSelectSuggestion: (suggestion: { url?: string; prompt: string }) => void;
}

const suggestions = [
  {
    icon: <Shield className="w-4 h-4 text-[#0F2A5C]" />,
    title: "Scan my web app",
    desc: "Run full autonomous security pipeline (FIND -> PROVE -> FIX -> VERIFY)",
    url: "https://demo-app.hackfix-labs.dev",
    prompt: "Scan my web app for OWASP Top 10 vulnerabilities and verify findings.",
  },
  {
    icon: <Sparkles className="w-4 h-4 text-[#2563EB]" />,
    title: "Explain this vulnerability",
    desc: "Translate technical security proofs into plain, understandable terms",
    prompt: "Explain how SQL injection happens in simple terms without heavy technical jargon.",
  },
];

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectSuggestion }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4 max-w-[680px] mx-auto select-none">
      {/* Brand Icon Block */}
      <div className="w-12 h-12 rounded-2xl bg-[#E3ECFA] text-[#0F2A5C] flex items-center justify-center mb-4 shadow-soft">
        <Shield className="w-6 h-6 text-[#0F2A5C]" />
      </div>

      {/* Centered Heading */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] tracking-tight mb-2">
        What would you like to secure today?
      </h1>

      {/* Subtext */}
      <p className="text-sm text-[#51627A] max-w-md mb-8 leading-relaxed">
        Paste your website link to start a scan, then chat with HackFix AI.
      </p>

      {/* 4 Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {suggestions.map((card, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() =>
              onSelectSuggestion({
                url: card.url,
                prompt: card.prompt,
              })
            }
            className="p-4 bg-[#F4F7FB] hover:bg-[#EAF0F8] border border-[#D9E2F0] rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-[#2563EB] shadow-soft"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1 rounded bg-white border border-[#D9E2F0]">
                {card.icon}
              </div>
              <h3 className="font-bold text-xs text-[#0B1F3A]">
                {card.title}
              </h3>
            </div>
            <p className="text-[11px] text-[#51627A] leading-relaxed">
              {card.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

