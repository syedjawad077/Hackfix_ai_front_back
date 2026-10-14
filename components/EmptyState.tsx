"use client";

import React from "react";
import { Shield, Search } from "lucide-react";

interface EmptyStateProps {
  onSelectSuggestion: (suggestion: { url?: string; prompt: string }) => void;
}

const suggestions = [
  {
    icon: <Shield className="w-4 h-4 text-[var(--ink)]" />,
    title: "Scan my web app",
    desc: "Run autonomous security pipeline (FIND -> PROVE -> FIX)",
    url: "https://demo-app.hackfix-labs.dev",
    prompt: "Scan my web app for OWASP Top 10 vulnerabilities and generate fix recommendations.",
  },
  {
    icon: <Search className="w-4 h-4 text-[var(--ink)]" />,
    title: "Explain this vulnerability",
    desc: "Translate technical security proofs into plain, understandable terms",
    prompt: "Explain how SQL injection happens in simple terms without heavy technical jargon.",
  },
];

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectSuggestion }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4 max-w-[680px] mx-auto select-none">
      {/* Brand Icon Block */}
      <div className="w-12 h-12 rounded-[8px] bg-[var(--paper-dark)] text-[var(--ink)] border border-[var(--line)] flex items-center justify-center mb-4 shadow-none">
        <Shield className="w-6 h-6 text-[var(--signal)]" />
      </div>

      {/* Centered Heading */}
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight mb-2 font-sans">
        What would you like to secure today?
      </h1>

      {/* Subtext */}
      <p className="text-sm text-[var(--ink-soft)] max-w-md mb-8 leading-relaxed font-sans">
        Paste your website link to start a scan, then chat with HackFix AI.
      </p>

      {/* Suggestion Cards */}
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
            className="interactive-card p-4 bg-[var(--paper-dark)] hover:bg-[#E2DCD1] border border-[var(--line)] rounded-[8px] text-left focus:outline-none focus:ring-2 focus:ring-[var(--signal)] shadow-none"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1 rounded-[8px] bg-[var(--paper)] border border-[var(--line)]">
                {card.icon}
              </div>
              <h3 className="font-bold text-xs text-[var(--ink)]">
                {card.title}
              </h3>
            </div>
            <p className="text-[11px] text-[var(--ink-soft)] leading-relaxed">
              {card.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
