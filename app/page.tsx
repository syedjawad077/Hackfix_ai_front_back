"use client";

import React, { useRef, useEffect } from "react";
import {
  Menu,
  Shield,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { Composer } from "@/components/Composer";
import { DropOverlay } from "@/components/DropOverlay";
import { OwnershipModal } from "@/components/OwnershipModal";
import { SettingsModal } from "@/components/SettingsModal";
import { Toast } from "@/components/Toast";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/useToast";
import { useHackFix } from "@/hooks/useHackFix";

export default function HomePage() {
  const { toasts, addToast, removeToast } = useToast();
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const {
    sessions,
    activeSessionId,
    activeSession,
    urlInput,
    setUrlInput,
    messageInput,
    setMessageInput,
    attachedZip,
    setAttachedZip,
    isScanning,
    retestingId,
    ownershipModalOpen,
    setOwnershipModalOpen,
    pendingScanUrl,
    isDraggingOverWindow,
    settingsModalOpen,
    setSettingsModalOpen,
    fastApiUrl,
    setFastApiUrl,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    handleNewScan,
    handleSelectSession,
    handleRenameSession,
    handleDeleteSession,
    handleComposerSubmit,
    handleConfirmOwnership,
    handleSendChatMessage,
    handleRetestFinding,
    handleSelectSuggestion,
  } = useHackFix(addToast);

  const messages = activeSession?.messages || [];
  const hasMessages = messages.length > 0;

  // Auto-scroll chat to bottom instantly on message update
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages.length, isScanning]);

  const handleRegenerateLastMessage = () => {
    if (messages.length === 0) return;
    const lastUserMessage = [...messages].reverse().find((m) => m.sender === "user");
    if (lastUserMessage) {
      handleSendChatMessage(lastUserMessage.text);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white text-[#0B1F3A] overflow-hidden">
      {/* Drop overlay for ZIP files */}
      <DropOverlay isDragging={isDraggingOverWindow} />

      {/* Ownership Confirmation Modal */}
      <OwnershipModal
        isOpen={ownershipModalOpen}
        targetUrl={pendingScanUrl}
        onConfirm={handleConfirmOwnership}
        onCancel={() => setOwnershipModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        fastApiUrl={fastApiUrl}
        onSaveFastApiUrl={(url) => {
          setFastApiUrl(url);
          addToast("FastAPI backend endpoint configuration saved", "success");
        }}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Left Sidebar (260px, collapsible, mobile drawer) */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewScan={handleNewScan}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenSettings={() => setSettingsModalOpen(true)}
      />

      {/* Main Chat & Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white">
        {/* Top Header bar */}
        <header className="h-14 border-b border-[#D9E2F0] px-4 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile hamburger menu toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-[#51627A] hover:text-[#0B1F3A] hover:bg-[#F4F7FB]"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded bg-[#0F2A5C] text-white flex items-center justify-center shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-bold text-[#0B1F3A] truncate">
                {activeSession?.title || "HackFix AI"}
              </h2>
              {activeSession?.ownershipVerified && (
                <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-[#0F2A5C] bg-[#E3ECFA] px-2 py-0.5 rounded-pill border border-[#D9E2F0]">
                  Ownership verified
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewScan}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0F2A5C] bg-[#F4F7FB] hover:bg-[#EAF0F8] border border-[#D9E2F0] rounded-pill"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New scan</span>
            </button>
          </div>
        </header>

        {/* Scrollable Center Area (max-width ~768px) */}
        <main
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto px-4 py-6"
        >
          <div className="max-w-[768px] mx-auto min-h-full flex flex-col justify-between">
            {/* Empty State vs Chat Messages */}
            {!hasMessages ? (
              <div className="my-auto">
                <EmptyState onSelectSuggestion={handleSelectSuggestion} />
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message, idx) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isLatestAssistantMessage={
                      message.sender === "assistant" && idx === messages.length - 1
                    }
                    onSelectQuickReply={handleSendChatMessage}
                    onRegenerate={handleRegenerateLastMessage}
                    onRetestFinding={handleRetestFinding}
                    retestingId={retestingId}
                    onToast={addToast}
                  />
                ))}

                {/* Plain Static Scanning / Loading State */}
                {isScanning && (
                  <div className="flex items-center gap-3 my-6 p-4 bg-[#F4F7FB] border border-[#D9E2F0] rounded-xl text-xs font-semibold text-[#0F2A5C]">
                    <RefreshCw className="w-4 h-4 text-[#2563EB]" />
                    <span>Scanning target application and analyzing security posture...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Sticky ChatGPT-style Bottom Composer */}
        <footer className="sticky bottom-0 bg-white border-t border-[#D9E2F0] shrink-0">
          <Composer
            url={urlInput}
            onUrlChange={setUrlInput}
            message={messageInput}
            onMessageChange={setMessageInput}
            attachedFile={attachedZip}
            onAttachFile={(file) => {
              setAttachedZip(file);
              addToast(`Attached ${file.name}`, "success");
            }}
            onRemoveFile={() => {
              setAttachedZip(null);
              addToast("Removed attached project ZIP", "info");
            }}
            onSubmit={handleComposerSubmit}
            isScanning={isScanning}
            ownershipVerified={activeSession?.ownershipVerified}
            onValidationError={(err) => addToast(err, "error")}
          />
        </footer>
      </div>
    </div>
  );
}

