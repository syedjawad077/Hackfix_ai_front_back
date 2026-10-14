"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  X,
  Shield,
  MessageSquare,
  Bot,
  User as UserIcon,
} from "lucide-react";
import { QuickChips } from "./QuickChips";
import { ChatMessage } from "@/lib/types";

interface AiHelperPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isThinking: boolean;
  hasScanResults: boolean;
  activeFindingTitle?: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const STARTER_CHIPS = [
  "Scan my web app",
  "Explain this vulnerability",
  "How do I secure my login page?",
];

const RESULT_CHIPS = [
  "Explain this simply",
  "What should I fix first?",
  "Show me the fix",
];

export function AiHelperPanel({
  messages,
  onSendMessage,
  isThinking,
  hasScanResults,
  activeFindingTitle,
  isOpenMobile = false,
  onCloseMobile,
}: AiHelperPanelProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages instantly
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
  }, [messages.length, isThinking]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isThinking) return;
    onSendMessage(trimmed);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeChips = hasScanResults ? RESULT_CHIPS : STARTER_CHIPS;

  const content = (
    <div className="flex flex-col h-full bg-[var(--paper)] border border-[var(--line)] rounded-[8px] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-[var(--paper-dark)] border-b border-[var(--line)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[8px] bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--ink)]">Ask HackFix AI</h3>
            <p className="text-[11px] text-[var(--ink-soft)]">Plain-English security answers</p>
          </div>
        </div>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-[8px] text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--paper)]"
            aria-label="Close assistant"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[var(--paper)]">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-[var(--ink-soft)]">
                {isUser ? (
                  <>
                    <span>You</span>
                    <span>• {msg.timestamp}</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-3 h-3 text-[var(--ink)]" />
                    <span className="font-semibold text-[var(--ink)]">HackFix AI</span>
                    <span>• {msg.timestamp}</span>
                  </>
                )}
              </div>

              <div
                className={`max-w-[88%] p-3 text-xs sm:text-sm rounded-[8px] ${
                  isUser
                    ? "bg-[var(--paper-dark)] text-[var(--ink)] border border-[var(--line)]"
                    : "bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)]"
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
              </div>
            </div>
          );
        })}

        {/* Static Thinking / Loading State (No animation) */}
        {isThinking && (
          <div className="flex items-start gap-2">
            <div className="bg-[var(--paper-dark)] border border-[var(--line)] px-3 py-2 rounded-[8px] text-xs text-[var(--ink-soft)] font-semibold">
              HackFix AI is thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input area */}
      <div className="p-3 bg-[var(--paper-dark)] border-t border-[var(--line)] space-y-2">
        {/* Quick-question chips */}
        <div>
          <div className="text-[10px] uppercase font-bold text-[var(--ink-soft)] tracking-wider mb-1">
            Quick questions
          </div>
          <QuickChips
            chips={activeChips}
            onSelectChip={(chip) => onSendMessage(chip)}
            disabled={isThinking}
          />
        </div>

        {/* Input box & send button */}
        <div className="flex items-end gap-2 bg-[var(--paper)] border border-[var(--line)] rounded-[8px] p-1.5 focus-within:border-[var(--signal)] focus-within:ring-1 focus-within:ring-[var(--signal)]">
          <textarea
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything (e.g. What should I fix first?)"
            className="flex-1 resize-none text-xs sm:text-sm text-[var(--ink)] bg-transparent outline-none p-1 placeholder:text-[var(--ink-soft)]/70"
            aria-label="Ask HackFix AI a security question"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() || isThinking}
            className="p-2 rounded-[8px] bg-[var(--ink)] text-[var(--paper)] hover:bg-[#333333] disabled:bg-[var(--line)] disabled:text-[var(--ink-soft)] disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-[var(--signal)]"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-between text-[10px] text-[var(--ink-soft)] px-1">
          <span>Press Enter to send</span>
          <span>Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block w-80 xl:w-96 shrink-0 h-[calc(100vh-8rem)] sticky top-20">
        {content}
      </div>

      {/* Mobile Drawer / Bottom Sheet */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-[#0B1F3A]/40">
          <div className="bg-white rounded-t-2xl max-h-[85vh] h-[580px] w-full flex flex-col shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
