'use client';

import React from 'react';
import {
  FileText,
  Pin,
  Archive,
  Plus,
  Tag as TagIcon,
  BookOpen,
  X,
} from 'lucide-react';
import { UserProfileMenu } from '@/components/UserProfileMenu';
import { AuthSession, NoteViewMode } from '@/types';

interface SidebarProps {
  user: AuthSession | null;
  activeView: NoteViewMode;
  onSelectView: (view: NoteViewMode) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  tags: string[];
  counts: {
    all: number;
    pinned: number;
    archived: number;
  };
  onCreateNote: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  user,
  activeView,
  onSelectView,
  selectedTag,
  onSelectTag,
  tags,
  counts,
  onCreateNote,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const handleNavClick = (view: NoteViewMode) => {
    onSelectView(view);
    onSelectTag(null);
    onCloseMobile();
  };

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      onSelectTag(null);
    } else {
      onSelectTag(tag);
    }
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-50/70 dark:bg-slate-900/90 border-r border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200">
      {/* App Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-none">
              Marko Polo
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Markdown Workspace
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Action Button */}
      <div className="p-3">
        <button
          type="button"
          onClick={() => {
            onCreateNote();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-xs transition-all active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Note</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Main views */}
        <div className="space-y-1">
          <button
            onClick={() => handleNavClick('all')}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
              activeView === 'all' && !selectedTag
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4" />
              <span>All Notes</span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => handleNavClick('pinned')}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
              activeView === 'pinned' && !selectedTag
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Pin className="w-4 h-4" />
              <span>Pinned Notes</span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {counts.pinned}
            </span>
          </button>

          <button
            onClick={() => handleNavClick('archived')}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
              activeView === 'archived' && !selectedTag
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Archive className="w-4 h-4" />
              <span>Archived Notes</span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {counts.archived}
            </span>
          </button>
        </div>

        {/* Tags Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TagIcon className="w-3 h-3" />
              <span>Tags</span>
            </span>
            {selectedTag && (
              <button
                onClick={() => onSelectTag(null)}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          {tags.length === 0 ? (
            <p className="px-3 text-xs text-slate-400 dark:text-slate-500 italic">
              No tags created yet
            </p>
          ) : (
            <div className="space-y-0.5">
              {tags.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors truncate ${
                      isSelected
                        ? 'bg-blue-100/70 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className="text-slate-400 font-mono">#</span>
                    <span className="truncate">{tag}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Profile Area */}
      <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/60">
        <UserProfileMenu user={user} />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-full shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

