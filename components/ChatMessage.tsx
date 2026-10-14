"use client";

import React, { useState } from "react";
import { Copy, Check, RotateCw, Shield } from "lucide-react";
import { ChatMessage as ChatMessageType, ScanReport, AttackSimulation } from "@/lib/types";
import { ScanStepper } from "./ScanStepper";
import { ScanLog } from "./ScanLog";
import { ReportSummary } from "./ReportSummary";
import { QuickReplies } from "./QuickReplies";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { AttackSimulationCard } from "./AttackSimulationCard";

interface ChatMessageProps {
  message: ChatMessageType;
  isLatestAssistantMessage?: boolean;
  onSelectQuickReply?: (reply: string) => void;
  onRegenerate?: () => void;
  onRetestFinding?: (findingId: string) => void;
  retestingId?: string | null;
  onOpenSimulation?: (sim: AttackSimulation) => void;
  onToast: (msg: string, type?: "info" | "success" | "warning" | "error") => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLatestAssistantMessage = false,
  onSelectQuickReply,
  onRegenerate,
  onRetestFinding,
  retestingId,
  onOpenSimulation,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === "user";

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    onToast("Message copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-4">
        <div className="max-w-[85%] sm:max-w-[75%] bg-[var(--paper-dark)] text-[var(--ink)] rounded-[8px] rounded-tr-[2px] px-4 py-3 shadow-none text-sm leading-relaxed border border-[var(--line)]">
          <p className="whitespace-pre-wrap font-sans">{message.text}</p>
          <span className="block text-[10px] text-[var(--ink-soft)] text-right mt-1 font-mono">
            {message.timestamp}
          </span>
        </div>
      </div>
    );
  }

  // Assistant Message (left-aligned, no bubble, near-black ink logo avatar)
  return (
    <div className="flex items-start gap-3 my-6 group">
      {/* Near-black ink logo avatar */}
      <div className="w-8 h-8 rounded-[8px] bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center shrink-0 shadow-none border border-[var(--line)]">
        <Shield className="w-4 h-4 text-[var(--paper)]" />
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-xs text-[var(--ink)]">HackFix AI</span>
          <span className="text-[10px] text-[var(--ink-soft)] font-mono">
            {message.timestamp}
          </span>
        </div>

        {/* Text body with full markdown rendering for headings, code blocks, bold, lists */}
        <div className="text-sm text-[var(--ink)] leading-relaxed font-sans">
          <MarkdownRenderer content={message.text} />
        </div>

        {/* Embedded Scan Pipeline Components if report is attached */}
        {message.scanReport && (
          <div className="mt-3">
            <ScanStepper stepper={message.scanReport.stepper} />
            <ScanLog logs={message.scanReport.logs} />
            <ReportSummary
              report={message.scanReport}
              onRetestFinding={onRetestFinding || (() => {})}
              retestingId={retestingId}
              onToast={onToast}
            />
          </div>
        )}

        {/* Embedded Executive Threat Simulation if present */}
        {message.simulation && (
          <div className="mt-3">
            <AttackSimulationCard
              simulation={message.simulation}
              onOpenModal={() => onOpenSimulation?.(message.simulation!)}
            />
          </div>
        )}

        {/* Action buttons under assistant replies: copy & regenerate */}
        <div className="flex items-center gap-2 mt-3 pt-1">
          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1 text-xs text-[var(--ink-soft)] hover:text-[var(--ink)] p-1.5 rounded-[8px] hover:bg-[var(--paper-dark)]"
            aria-label="Copy assistant reply"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--signal)]" />
                <span className="text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>

          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center gap-1 text-xs text-[var(--ink-soft)] hover:text-[var(--ink)] p-1.5 rounded-[8px] hover:bg-[var(--paper-dark)]"
              aria-label="Regenerate reply"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="text-[11px]">Regenerate</span>
            </button>
          )}
        </div>

        {/* Quick-reply chips if present and is latest message */}
        {isLatestAssistantMessage &&
          message.quickReplies &&
          message.quickReplies.length > 0 &&
          onSelectQuickReply && (
            <div className="mt-2">
              <QuickReplies
                replies={message.quickReplies}
                onSelect={onSelectQuickReply}
              />
            </div>
          )}
      </div>
    </div>
  );
};
