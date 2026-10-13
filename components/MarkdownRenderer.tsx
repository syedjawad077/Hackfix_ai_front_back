"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-[#D9E2F0] bg-[#0B1F3A] text-white shadow-soft">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#071324] border-b border-[#1E3A66] text-xs font-mono text-[#D9E2F0]">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#93C5FD]">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-[11px] text-[#D9E2F0] hover:text-white px-2 py-0.5 rounded hover:bg-[#1E3A66] cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#60A5FA]" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-xs font-mono leading-relaxed text-[#F4F7FB]">
        <code>{code}</code>
      </pre>
    </div>
  );
};

function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // Split tokens for inline formatting: `code`, **bold**, *italic*, [link](url)
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Inline Code
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={idx}
          className="font-mono text-xs bg-[#F4F7FB] text-[#0F2A5C] px-1.5 py-0.5 rounded border border-[#D9E2F0] font-semibold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={idx} className="font-bold text-[#0B1F3A]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return (
        <em key={idx} className="italic text-[#0B1F3A]">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Link: [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#2563EB] hover:text-[#1D4ED8] underline font-medium"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockLines: string[] = [];

  let currentListType: "ul" | "ol" | null = null;
  let currentListItems: React.ReactNode[] = [];

  const flushList = () => {
    if (currentListType && currentListItems.length > 0) {
      if (currentListType === "ul") {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-2 space-y-1 list-disc pl-5 text-sm leading-relaxed text-[#0B1F3A]">
            {currentListItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-2 space-y-1 list-decimal pl-5 text-sm leading-relaxed text-[#0B1F3A]">
            {currentListItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        );
      }
      currentListType = null;
      currentListItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Fenced Code Block delimiter
    if (trimmed.startsWith("```")) {
      flushList();
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim();
        codeBlockLines = [];
      } else {
        inCodeBlock = false;
        elements.push(
          <CodeBlock
            key={`code-${elements.length}`}
            language={codeBlockLang}
            code={codeBlockLines.join("\n")}
          />
        );
        codeBlockLines = [];
        codeBlockLang = "";
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Empty line
    if (!trimmed) {
      flushList();
      continue;
    }

    // Headings
    if (trimmed.startsWith("#### ")) {
      flushList();
      elements.push(
        <h4 key={`h4-${elements.length}`} className="text-xs font-bold text-[#0F2A5C] uppercase tracking-wider mt-3 mb-1">
          {renderInline(trimmed.slice(5))}
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={`h3-${elements.length}`} className="text-sm font-bold text-[#0B1F3A] mt-3.5 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-3.5 bg-[#2563EB] rounded-full inline-block shrink-0" />
          <span>{renderInline(trimmed.slice(4))}</span>
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={`h2-${elements.length}`} className="text-base font-bold text-[#0B1F3A] mt-4 mb-2 pb-1 border-b border-[#D9E2F0]">
          {renderInline(trimmed.slice(3))}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h1 key={`h1-${elements.length}`} className="text-lg font-bold text-[#0B1F3A] mt-4 mb-2">
          {renderInline(trimmed.slice(2))}
        </h1>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${elements.length}`}
          className="my-2 border-l-3 border-[#2563EB] pl-3 py-1 bg-[#F4F7FB] text-xs text-[#0F2A5C] italic rounded-r"
        >
          {renderInline(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered List (- or *)
    const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      if (currentListType !== "ul") {
        flushList();
        currentListType = "ul";
      }
      currentListItems.push(renderInline(ulMatch[1]));
      continue;
    }

    // Ordered List (1. )
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (currentListType !== "ol") {
        flushList();
        currentListType = "ol";
      }
      currentListItems.push(renderInline(olMatch[1]));
      continue;
    }

    // Regular Paragraph
    flushList();
    elements.push(
      <p key={`p-${elements.length}`} className="my-2 text-sm leading-relaxed text-[#0B1F3A]">
        {renderInline(line)}
      </p>
    );
  }

  // Flush any lingering list or unclosed code block
  flushList();
  if (inCodeBlock && codeBlockLines.length > 0) {
    elements.push(
      <CodeBlock
        key={`code-${elements.length}`}
        language={codeBlockLang}
        code={codeBlockLines.join("\n")}
      />
    );
  }

  return <div className="space-y-1">{elements}</div>;
};

