"use client";

import React, { useState } from "react";
import {
  Shield,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit2,
  Settings,
  X,
  MessageSquare,
  Check,
} from "lucide-react";
import { ChatSession } from "@/lib/types";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewScan: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewScan,
  onDeleteSession,
  onRenameSession,
  isOpenMobile,
  onCloseMobile,
  onOpenSettings,
}) => {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const groups = [
    { key: "today", label: "Today" },
  ] as const;

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(session.id);
    setRenameValue(session.title);
    setMenuOpenId(null);
  };

  const handleSaveRename = (sessionId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (renameValue.trim()) {
      onRenameSession(sessionId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handleDelete = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSession(sessionId);
    setMenuOpenId(null);
  };

  const renderSessionItem = (session: ChatSession) => {
    const isActive = session.id === activeSessionId;
    const isMenuOpen = menuOpenId === session.id;
    const isRenaming = renamingId === session.id;

    if (isRenaming) {
      return (
        <form
          key={session.id}
          onSubmit={(e) => handleSaveRename(session.id, e)}
          className="flex items-center gap-1.5 px-2 py-1.5 bg-[#222222] border border-[var(--signal)] rounded-[8px] my-1"
        >
          <input
            type="text"
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={(e) => handleSaveRename(session.id, e)}
            className="flex-1 text-xs text-[#F5F1EA] bg-transparent outline-none font-sans"
          />
          <button
            type="submit"
            className="p-1 text-[var(--signal)] hover:bg-[#333333] rounded-[8px]"
            aria-label="Save rename"
          >
            <Check className="w-3 h-3" />
          </button>
        </form>
      );
    }

    return (
      <div
        key={session.id}
        className={`group relative flex items-center justify-between text-xs cursor-pointer select-none mb-1 sidebar-item ${
          isActive
            ? "bg-[#282828] text-[#F5F1EA] font-semibold border-l-[3px] border-l-[var(--signal)] pl-2.5 pr-3 py-2 rounded-r-[8px]"
            : "text-[#D9D2C4] hover:bg-[#252525] hover:text-[#F5F1EA] px-3 py-2 rounded-[8px]"
        }`}
        onClick={() => {
          onSelectSession(session.id);
          onCloseMobile();
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onSelectSession(session.id);
            onCloseMobile();
          }
        }}
        aria-selected={isActive}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
          <MessageSquare
            className={`w-3.5 h-3.5 shrink-0 ${
              isActive ? "text-[var(--signal)]" : "text-[#8A857B]"
            }`}
          />
          <span className="truncate">{session.title}</span>
        </div>

        {/* Hover "..." menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpenId(isMenuOpen ? null : session.id);
            }}
            className={`p-1 rounded-[8px] text-[#8A857B] hover:text-[#F5F1EA] hover:bg-white/10 ${
              isMenuOpen ? "block" : "hidden group-hover:block"
            }`}
            aria-label="Options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Context menu dropdown */}
          {isMenuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-28 bg-[#222222] border border-[#333333] rounded-[8px] py-1 z-30 shadow-none text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => handleStartRename(session, e)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#F5F1EA] hover:bg-[#2E2E2E] text-left"
              >
                <Edit2 className="w-3 h-3 text-[#8A857B]" />
                <span>Rename</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleDelete(session.id, e)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#D7263D] hover:bg-[#3D1A1E] text-left"
              >
                <Trash2 className="w-3 h-3 text-[#D7263D]" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <aside
      className="w-[260px] h-full flex flex-col bg-[#1B1B1B] border-r border-[#2C2C2C] select-none text-[#F5F1EA]"
      aria-label="Chat sidebar"
    >
      {/* Header: Logo and Wordmark */}
      <div className="p-4 flex items-center justify-between border-b border-[#2C2C2C]">
        <div className="flex items-center gap-2.5">
          {/* Signal orange logo block */}
          <div className="w-7 h-7 rounded-[8px] bg-[var(--signal)] text-white flex items-center justify-center font-bold text-xs">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-[#F5F1EA]">
            HackFix AI
          </span>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="md:hidden p-1 rounded-[8px] text-[#8A857B] hover:text-[#F5F1EA]"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* "+ New scan" button in signal orange */}
      <div className="p-3">
        <button
          type="button"
          onClick={() => {
            onNewScan();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--signal)] hover:bg-[var(--signal-dark)] text-white rounded-[8px] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--signal)]"
        >
          <Plus className="w-4 h-4" />
          <span>New scan</span>
        </button>
      </div>

      {/* Scrollable History grouped by Today */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {groups.map(({ key, label }) => {
          const groupSessions = sessions.filter((s) => s.group === key);
          if (groupSessions.length === 0) return null;

          return (
            <div key={key}>
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#8A857B] px-2 mb-1.5">
                {label}
              </h5>
              <div>{groupSessions.map(renderSessionItem)}</div>
            </div>
          );
        })}
      </div>

      {/* Footer: user avatar placeholder and settings */}
      <div className="p-3 border-t border-[#2C2C2C] flex items-center justify-between bg-[#171717]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-[8px] bg-[#2A2A2A] text-[#F5F1EA] border border-[#3A3A3A] flex items-center justify-center font-bold text-xs">
            SH
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#F5F1EA] truncate">
              Security Lead
            </p>
            <p className="text-[10px] text-[#8A857B] truncate">
              AppSec Engineer
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 rounded-[8px] text-[#8A857B] hover:text-[#F5F1EA] hover:bg-[#2A2A2A]"
          aria-label="Open settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block h-screen shrink-0">{sidebarContent}</div>

      {/* Mobile drawer with backdrop */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#1B1B1B]/60"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
