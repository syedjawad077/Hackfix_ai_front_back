"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, AlertCircle } from "lucide-react";
import { FileChip } from "./FileChip";

interface ZipUploadProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export function ZipUpload({
  file,
  onFileSelect,
  onFileRemove,
  disabled = false,
}: ZipUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndHandleFile = (candidate: File) => {
    setErrorMessage(null);

    // Validate .zip extension or zip mime type
    const isZip =
      candidate.name.toLowerCase().endsWith(".zip") ||
      candidate.type === "application/zip" ||
      candidate.type === "application/x-zip-compressed";

    if (!isZip) {
      setErrorMessage("Please upload a .zip file only. Skip this step if you don't have code to upload.");
      return;
    }

    if (candidate.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage("File exceeds 50 MB limit. Please compress your project or skip this optional step.");
      return;
    }

    onFileSelect(candidate);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndHandleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndHandleFile(e.target.files[0]);
    }
    // reset input value so re-uploading the same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      {file ? (
        <FileChip
          fileName={file.name}
          fileSize={file.size}
          onRemove={onFileRemove}
          disabled={disabled}
        />
      ) : (
        <div>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`w-full border-2 border-dashed ${
              isDragOver
                ? "border-[var(--signal)] bg-[var(--paper-dark)]"
                : "border-[var(--line)] bg-[var(--paper)] hover:border-[var(--signal)] hover:bg-[var(--paper-dark)]"
            } rounded-[8px] p-6 text-center cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-[var(--signal)]`}
            aria-label="Upload project .zip - optional"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              onChange={handleInputChange}
              disabled={disabled}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-[8px] bg-[var(--paper-dark)] border border-[var(--line)] flex items-center justify-center mx-auto mb-2 text-[var(--ink)]">
              <UploadCloud className="w-5 h-5 text-[var(--signal)]" />
            </div>
            <p className="text-sm font-bold text-[var(--ink)]">
              Upload project (.zip) - optional
            </p>
            <p className="text-xs text-[var(--ink-soft)] mt-1">
              Drag & drop your .zip file here, or click to browse (up to 50 MB)
            </p>
            <p className="text-[11px] text-[var(--ink-soft)]/80 mt-2 italic">
              Skip this if you only want to test the live website.
            </p>
          </div>

          {errorMessage && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#D7263D] font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
