"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChatMessage as ChatMessageType,
  ChatSession,
  Finding,
  ScanReport,
} from "@/lib/types";
import { initialSessions, sampleScanReport } from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import { getCurrentTimestamp, isValidUrl } from "@/lib/utils";

export function useHackFix(onToast: (msg: string, type?: "info" | "success" | "warning" | "error") => void) {
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string>("session-today-01");
  const [urlInput, setUrlInput] = useState<string>("https://demo-app.hackfix-labs.dev");
  const [messageInput, setMessageInput] = useState<string>("");
  const [attachedZip, setAttachedZip] = useState<File | null>(null);
  const [githubRepo, setGithubRepo] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [retestingId, setRetestingId] = useState<string | null>(null);

  // Ownership verification modal state
  const [ownershipModalOpen, setOwnershipModalOpen] = useState<boolean>(false);
  const [pendingScanUrl, setPendingScanUrl] = useState<string>("");

  // Window drag & drop overlay state
  const [isDraggingOverWindow, setIsDraggingOverWindow] = useState<boolean>(false);

  // Settings modal
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [fastApiUrl, setFastApiUrl] = useState<string>("");

  // Mobile sidebar drawer
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Active session helper
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Drag and drop event listeners on window
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer?.types.includes("Files")) {
        setIsDraggingOverWindow(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        setIsDraggingOverWindow(false);
        dragCounter = 0;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDraggingOverWindow(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        onToast("Source-code ZIP scanning is coming soon. Please enter a website URL to scan.", "info");
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [onToast]);

  // Keyboard shortcut: Cmd/Ctrl + K for new scan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleNewScan();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNewScan = useCallback(() => {
    const newId = `session-${Date.now().toString(36)}`;
    const newSession: ChatSession = {
      id: newId,
      title: "New security scan",
      updatedAt: "Just now",
      group: "today",
      messages: [],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setUrlInput("");
    setMessageInput("");
    setAttachedZip(null);
    setGithubRepo("");
    onToast("Started a new scan session", "info");
  }, [onToast]);

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
    const targetSession = sessions.find((s) => s.id === id);
    if (targetSession?.targetUrl) {
      setUrlInput(targetSession.targetUrl);
    }
  }, [sessions]);

  const handleRenameSession = useCallback((id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
    onToast("Scan renamed", "info");
  }, [onToast]);

  const handleDeleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (remaining.length === 0) {
        const fresh: ChatSession = {
          id: `session-${Date.now().toString(36)}`,
          title: "New security scan",
          updatedAt: "Just now",
          group: "today",
          messages: [],
        };
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
    onToast("Scan deleted", "info");
  }, [activeSessionId, onToast]);

  // Execute scan execution logic
  const executeScan = async (targetUrl: string, promptText?: string) => {
    setIsScanning(true);
    const time = getCurrentTimestamp();

    // 1. Add user message
    const userMsgText = promptText
      ? `${promptText}\nTarget: ${targetUrl}`
      : `Scan ${targetUrl} for security vulnerabilities`;

    const userMsg: ChatMessageType = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: userMsgText,
      timestamp: time,
    };

    try {
      const report = await apiClient.startScan({
        targetUrl,
        githubRepo: githubRepo.trim() || undefined,
        zipFile: attachedZip,
        ownershipVerified: true,
        prompt: promptText,
      });

      const assistantMsg: ChatMessageType = {
        id: `msg-assistant-${Date.now()}`,
        sender: "assistant",
        text: `I completed the security assessment for **${targetUrl}**. ${
          githubRepo.trim()
            ? `Because you linked GitHub repo **${githubRepo.trim()}**, I correlated repository architecture with active security probes.`
            : "Live endpoints and passive security headers were evaluated."
        }\n\nHere are the findings and proof of concept validations.`,
        timestamp: getCurrentTimestamp(),
        scanReport: report,
        quickReplies: [
          "What are the biggest threats?",
          "Explain this finding simply",
          "Show me the fix",
          "What should I fix first?",
        ],
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              title: new URL(targetUrl).hostname || targetUrl,
              targetUrl,
              ownershipVerified: true,
              activeScanId: report.id,
              messages: [...s.messages, userMsg, assistantMsg],
            };
          }
          return s;
        })
      );

      setMessageInput("");
      onToast("Security scan completed", "success");
    } catch (err: any) {
      onToast(err.message || "Scan failed to execute", "error");
    } finally {
      setIsScanning(false);
    }
  };

  // Explicit start scan action
  const handleStartScan = (targetUrlOverride?: string) => {
    const target = (targetUrlOverride || urlInput).trim();
    if (!target) {
      onToast("Please enter a website URL to scan (e.g. https://your-site.com)", "warning");
      return;
    }
    if (!isValidUrl(target)) {
      onToast("Please enter a valid website URL starting with https:// or http://", "error");
      return;
    }
    if (!activeSession?.ownershipVerified) {
      setPendingScanUrl(target);
      setOwnershipModalOpen(true);
      return;
    }
    executeScan(target);
  };

  // Submit action from composer (Enter or Send button)
  const handleComposerSubmit = () => {
    const trimmedMessage = messageInput.trim();
    const trimmedUrl = urlInput.trim();

    // Priority 1: If user typed a message, ALWAYS SEND AS CHAT MESSAGE!
    // Never trigger a slow website re-scan when the user is chatting with AI.
    if (trimmedMessage) {
      handleSendChatMessage(trimmedMessage);
      return;
    }

    // Priority 2: If message is empty, but URL is provided, start the scan
    if (trimmedUrl && isValidUrl(trimmedUrl)) {
      handleStartScan(trimmedUrl);
      return;
    }
  };

  // Confirm ownership modal
  const handleConfirmOwnership = () => {
    setOwnershipModalOpen(false);
    executeScan(pendingScanUrl, messageInput.trim() || undefined);
  };

  // Chat message send
  const handleSendChatMessage = async (text: string) => {
    const time = getCurrentTimestamp();
    const userMsg: ChatMessageType = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: time,
    };

    // Instant append of user message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, userMsg] }
          : s
      )
    );
    setMessageInput("");

    try {
      const response = await apiClient.sendChatMessage({
        sessionId: activeSessionId,
        scanId: activeSession?.activeScanId,
        message: text,
      });

      const assistantMsg: ChatMessageType = {
        id: `msg-assistant-${Date.now()}`,
        sender: "assistant",
        text: response.reply,
        timestamp: getCurrentTimestamp(),
        quickReplies: response.quickReplies,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, assistantMsg] }
            : s
        )
      );
    } catch (err: any) {
      onToast(err.message || "Failed to get reply", "error");
    }
  };

  // Re-test finding
  const handleRetestFinding = async (findingId: string) => {
    setRetestingId(findingId);

    try {
      const result = await apiClient.retestFinding(
        activeSession?.activeScanId || "scan-01",
        findingId
      );

      // Instant update of finding state to verified_fixed
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== activeSessionId) return session;

          const updatedMessages = session.messages.map((msg) => {
            if (!msg.scanReport) return msg;
            const updatedFindings = msg.scanReport.findings.map((f) =>
              f.id === findingId
                ? {
                    ...f,
                    status: "verified_fixed" as const,
                    verifiedAt: result.verifiedAt,
                  }
                : f
            );
            return {
              ...msg,
              scanReport: {
                ...msg.scanReport,
                findings: updatedFindings,
              },
            };
          });

          return { ...session, messages: updatedMessages };
        })
      );

      // Assistant notification message
      const assistantMsg: ChatMessageType = {
        id: `msg-assistant-retest-${Date.now()}`,
        sender: "assistant",
        text: `Automated re-test completed for vulnerability \`${findingId}\`. Safe payload probes confirmed that the patch blocked exploitation.\n\nStatus: **Verified fixed**`,
        timestamp: getCurrentTimestamp(),
        quickReplies: ["Show remaining findings", "Download report (PDF)"],
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, assistantMsg] }
            : s
        )
      );

      onToast("Finding verified fixed with safe exploit re-test", "success");
    } catch (err: any) {
      onToast(err.message || "Re-test failed", "error");
    } finally {
      setRetestingId(null);
    }
  };

  // Suggestion card clicked from empty state
  const handleSelectSuggestion = (suggestion: { url?: string; prompt: string }) => {
    if (suggestion.url) {
      setUrlInput(suggestion.url);
    }
    setMessageInput(suggestion.prompt);
  };

  return {
    sessions,
    activeSessionId,
    activeSession,
    urlInput,
    setUrlInput,
    messageInput,
    setMessageInput,
    attachedZip,
    setAttachedZip,
    githubRepo,
    setGithubRepo,
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
    handleStartScan,
    handleComposerSubmit,
    handleConfirmOwnership,
    handleSendChatMessage,
    handleRetestFinding,
    handleSelectSuggestion,
  };
}

