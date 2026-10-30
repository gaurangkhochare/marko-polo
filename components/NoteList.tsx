'use client';

import React from 'react';
import {
  Search,
  X,
  ArrowUpDown,
  Menu,
  FileQuestion,
  FileText,
  Pin,
  Archive,
  Plus,
} from 'lucide-react';
import { NoteCard } from '@/components/NoteCard';
import { INote, NoteSortOption, NoteViewMode } from '@/types';

interface NoteListProps {
  notes: INote[];
  selectedNote: INote | null;
  onSelectNote: (note: INote) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: NoteSortOption;
  onSortChange: (sort: NoteSortOption) => void;
  activeView: NoteViewMode;
  selectedTag: string | null;
  isLoading: boolean;
  onOpenMobileMenu: () => void;
  onCreateNote: () => void;
}

export function NoteList({
  notes,
  selectedNote,
  onSelectNote,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  activeView,
  selectedTag,
  isLoading,
  onOpenMobileMenu,
  onCreateNote,
}: NoteListProps) {
  // Determine display title
  let title = 'All Notes';
  if (selectedTag) {
    title = `#${selectedTag}`;
  } else if (activeView === 'pinned') {
    title = 'Pinned Notes';
  } else if (activeView === 'archived') {
    title = 'Archived Notes';
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-100/50 dark:bg-slate-800/30 border-r border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
      {/* Search and Header */}
      <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-lg text-slate-900 dark:text-white truncate">
              {title}
            </h2>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search title & markdown..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort:</span>
          </div>
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as NoteSortOption)}
            className="bg-transparent font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
          >
            <option value="updatedAt_desc" className="dark:bg-slate-900">
              Recently Updated
            </option>
            <option value="createdAt_desc" className="dark:bg-slate-900">
              Date Created
            </option>
            <option value="title_asc" className="dark:bg-slate-900">
              Title (A-Z)
            </option>
          </select>
        </div>
      </div>

      {/* Notes List Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 animate-pulse space-y-2"
              >
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500">
            {searchQuery ? (
              <>
                <FileQuestion className="w-10 h-10 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  No matching notes
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  No notes match &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  onClick={() => onSearchChange('')}
                  className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear search
                </button>
              </>
            ) : selectedTag ? (
              <>
                <FileText className="w-10 h-10 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  No notes tagged #{selectedTag}
                </p>
              </>
            ) : activeView === 'pinned' ? (
              <>
                <Pin className="w-10 h-10 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  No pinned notes
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Pin important notes to access them quickly
                </p>
              </>
            ) : activeView === 'archived' ? (
              <>
                <Archive className="w-10 h-10 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Archive is empty
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Archived notes will appear here
                </p>
              </>
            ) : (
              <>
                <FileText className="w-10 h-10 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  No notes yet
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-4">
                  Capture thoughts, write docs, or organize ideas in Markdown
                </p>
                <button
                  onClick={onCreateNote}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create note</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                isSelected={selectedNote?._id === note._id}
                onSelect={onSelectNote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

