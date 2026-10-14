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
import { AttackSimulationModal } from "@/components/AttackSimulationModal";
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
    githubRepo,
    setGithubRepo,
    attachedZip,
    setAttachedZip,
    isScanning,
    retestingId,
    isSimulating,
    simulationModalOpen,
    setSimulationModalOpen,
    currentSimulation,
    setCurrentSimulation,
    handleRunSimulation,
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
    handleStartScan,
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
    <div className="flex h-screen w-full bg-[var(--paper)] text-[var(--ink)] overflow-hidden">
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

      {/* Executive Attack Path Simulation Modal */}
      <AttackSimulationModal
        isOpen={simulationModalOpen}
        onClose={() => setSimulationModalOpen(false)}
        simulation={currentSimulation}
        onToast={addToast}
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
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[var(--paper)]">
        {/* Top Header bar */}
        <header className="h-14 border-b border-[var(--line)] px-4 flex items-center justify-between bg-[var(--paper)] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile hamburger menu toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-[8px] text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--paper-dark)]"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-[8px] bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-bold text-[var(--ink)] truncate">
                {activeSession?.title || "HackFix AI"}
              </h2>
              {activeSession?.ownershipVerified && (
                <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-[var(--ink)] bg-[var(--paper-dark)] px-2 py-0.5 rounded-[8px] border border-[var(--line)]">
                  Ownership verified
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewScan}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[var(--signal)] hover:bg-[var(--signal-dark)] rounded-[8px]"
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
                    onOpenSimulation={(sim) => {
                      setCurrentSimulation(sim);
                      setSimulationModalOpen(true);
                    }}
                    onToast={addToast}
                  />
                ))}

                {/* Plain Static Scanning / Loading State */}
                {isScanning && (
                  <div className="flex items-center gap-3 my-6 p-4 bg-[var(--paper-dark)] border border-[var(--line)] rounded-[8px] text-xs font-semibold text-[var(--ink)]">
                    <RefreshCw className="w-4 h-4 text-[var(--signal)]" />
                    <span>Scanning target application and analyzing security posture...</span>
                  </div>
                )}
                {isSimulating && (
                  <div className="flex items-center gap-3 my-6 p-4 bg-[var(--paper-dark)] border border-[var(--line)] rounded-[8px] text-xs font-semibold text-[var(--ink)]">
                    <RefreshCw className="w-4 h-4 text-[var(--signal)]" />
                    <span>Simulating adversary attack path and executive impact...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Sticky ChatGPT-style Bottom Composer */}
        <footer className="sticky bottom-0 bg-[var(--paper)] border-t border-[var(--line)] shrink-0">
          <Composer
            url={urlInput}
            onUrlChange={setUrlInput}
            message={messageInput}
            onMessageChange={setMessageInput}
            githubRepo={githubRepo}
            onGithubRepoChange={setGithubRepo}
            onStartScan={handleStartScan}
            onSimulateAttack={handleRunSimulation}
            onSubmit={handleComposerSubmit}
            isScanning={isScanning}
            isSimulating={isSimulating}
            activeScanId={activeSession?.activeScanId}
            scannedUrl={activeSession?.targetUrl}
            ownershipVerified={activeSession?.ownershipVerified}
            onValidationError={(err) => addToast(err, "error")}
          />
        </footer>
      </div>
    </div>
  );
}

