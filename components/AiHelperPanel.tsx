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
    <div className="flex flex-col h-full bg-white border border-[#D9E2F0] rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-[#F4F7FB] border-b border-[#D9E2F0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#0F2A5C] text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0B1F3A]">Ask HackFix AI</h3>
            <p className="text-[11px] text-[#51627A]">Plain-English security answers</p>
          </div>
        </div>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-[#51627A] hover:text-[#0B1F3A] hover:bg-white"
            aria-label="Close assistant"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-[#51627A]">
                {isUser ? (
                  <>
                    <span>You</span>
                    <span>• {msg.timestamp}</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-3 h-3 text-[#2563EB]" />
                    <span className="font-semibold text-[#0B1F3A]">HackFix AI</span>
                    <span>• {msg.timestamp}</span>
                  </>
                )}
              </div>

              <div
                className={`max-w-[88%] p-3 text-xs sm:text-sm rounded-2xl ${
                  isUser
                    ? "bg-[#E3ECFA] text-[#0B1F3A] rounded-tr-sm"
                    : "bg-[#F4F7FB] border border-[#D9E2F0] text-[#0B1F3A] rounded-tl-sm"
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
            <div className="bg-[#F4F7FB] border border-[#D9E2F0] px-3 py-2 rounded-xl text-xs text-[#51627A] font-semibold">
              HackFix AI is thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input area */}
      <div className="p-3 bg-[#F4F7FB] border-t border-[#D9E2F0] space-y-2">
        {/* Quick-question chips */}
        <div>
          <div className="text-[10px] uppercase font-bold text-[#51627A] tracking-wider mb-1">
            Quick questions
          </div>
          <QuickChips
            chips={activeChips}
            onSelectChip={(chip) => onSendMessage(chip)}
            disabled={isThinking}
          />
        </div>

        {/* Input box & send button */}
        <div className="flex items-end gap-2 bg-white border border-[#D9E2F0] rounded-xl p-1.5 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#E3ECFA]">
          <textarea
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything (e.g. What should I fix first?)"
            className="flex-1 resize-none text-xs sm:text-sm text-[#0B1F3A] bg-transparent outline-none p-1 placeholder:text-[#51627A]/70"
            aria-label="Ask HackFix AI a security question"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() || isThinking}
            className="p-2 rounded-lg bg-[#0F2A5C] text-white hover:bg-[#0A1F47] disabled:bg-[#D9E2F0] disabled:text-[#51627A] disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-between text-[10px] text-[#51627A] px-1">
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
