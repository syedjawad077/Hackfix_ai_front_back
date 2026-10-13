"use client";

import React, { useRef, useEffect } from "react";
import { Paperclip, ArrowUp } from "lucide-react";
import { UrlInput } from "./UrlInput";
import { FileChip } from "./FileChip";
import { isValidUrl } from "@/lib/utils";

interface ComposerProps {
  url: string;
  onUrlChange: (url: string) => void;
  message: string;
  onMessageChange: (message: string) => void;
  attachedFile: File | null;
  onAttachFile: (file: File) => void;
  onRemoveFile: () => void;
  onSubmit: () => void;
  isScanning?: boolean;
  ownershipVerified?: boolean;
  onValidationError?: (err: string) => void;
}

export const Composer: React.FC<ComposerProps> = ({
  url,
  onUrlChange,
  message,
  onMessageChange,
  attachedFile,
  onAttachFile,
  onRemoveFile,
  onSubmit,
  isScanning = false,
  ownershipVerified = false,
  onValidationError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [message]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".zip")) {
      onValidationError?.("Only .zip files are accepted for optional source code review.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      onValidationError?.("ZIP archive exceeds maximum allowed size of 50 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    onAttachFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit =
    !isScanning &&
    (message.trim().length > 0 || (url.trim().length > 0 && isValidUrl(url.trim())));

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit();
  };

  return (
    <div className="w-full max-w-[768px] mx-auto px-4 pb-4 pt-1">
      {/* Optional attached zip chip */}
      {attachedFile && (
        <div className="mb-2">
          <FileChip
            fileName={attachedFile.name}
            fileSize={attachedFile.size}
            onRemove={onRemoveFile}
            disabled={isScanning}
          />
        </div>
      )}

      {/* Main Composer Box */}
      <div className="bg-white border border-[#D9E2F0] rounded-2xl shadow-card overflow-hidden focus-within:ring-2 focus-within:ring-[#2563EB] focus-within:border-transparent">
        {/* Top Part: Website Link Field */}
        <div className="p-3 border-b border-[#D9E2F0] bg-[#F4F7FB]/40">
          <UrlInput
            value={url}
            onChange={onUrlChange}
            onClear={() => onUrlChange("")}
            disabled={isScanning}
            ownershipVerified={ownershipVerified}
          />
        </div>

        {/* Bottom Part: Textarea & Action Buttons */}
        <div className="p-3 bg-white">
          <textarea
            ref={textareaRef}
            rows={1}
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isScanning}
            placeholder="Ask HackFix AI anything or describe what to test..."
            className="w-full resize-none border-0 bg-transparent text-sm text-[#0B1F3A] placeholder-[#51627A]/60 focus:outline-none focus:ring-0 leading-relaxed max-h-[180px] min-h-[38px]"
          />

          <div className="flex items-center justify-between pt-2 mt-1">
            {/* Paperclip Button for Optional ZIP (Disabled / Coming Soon) */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={true}
                className="flex items-center gap-1 text-xs text-[#51627A] bg-[#F4F7FB] px-2.5 py-1.5 rounded-pill border border-[#D9E2F0] opacity-60 cursor-not-allowed"
                aria-label="Upload project (.zip) - Coming soon"
                title="Source ZIP scanning is coming soon"
              >
                <Paperclip className="w-3.5 h-3.5 text-[#51627A]" />
                <span className="hidden sm:inline text-[11px] font-medium">
                  Upload .zip (Coming soon)
                </span>
              </button>
            </div>

            {/* Circular Send Button with Up-Arrow */}
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                canSubmit
                  ? "bg-[#0F2A5C] hover:bg-[#0A1F47] shadow-soft cursor-pointer"
                  : "bg-[#D9E2F0] text-[#51627A] cursor-not-allowed opacity-60"
              }`}
              aria-label={
                isScanning
                  ? "Scanning..."
                  : url && !message
                  ? "Start scan"
                  : "Send message"
              }
            >
              <ArrowUp className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Footnote */}
      <p className="text-center text-[11px] text-[#51627A] mt-2 select-none">
        HackFix AI only tests apps you own. Results may need review.
      </p>
    </div>
  );
};

