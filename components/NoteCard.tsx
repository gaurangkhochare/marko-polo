'use client';

import React from 'react';
import { Pin, Archive, Tag } from 'lucide-react';
import { INote } from '@/types';

interface NoteCardProps {
  note: INote;
  isSelected: boolean;
  onSelect: (note: INote) => void;
}

/**
 * Strips common markdown formatting to produce a clean text snippet for previews
 */
function getMarkdownSnippet(markdown: string): string {
  if (!markdown) return 'No content...';
  const clean = markdown
    .replace(/^#+\s+/gm, '') // headings
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // italic
    .replace(/~~(.*?)~~/g, '$1') // strikethrough
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // inline code / blocks
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links
    .replace(/^\s*[-*+]\s+/gm, '') // lists
    .replace(/^\s*\d+\.\s+/gm, '') // numbered lists
    .replace(/^\s*>\s+/gm, '') // blockquotes
    .replace(/\|/g, ' ') // tables
    .trim();

  return clean || 'No content...';
}

/**
 * Formats date into a user-friendly relative timestamp
 */
function formatNoteDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return '';
  }
}

export function NoteCard({ note, isSelected, onSelect }: NoteCardProps) {
  const snippet = getMarkdownSnippet(note.content);
  const formattedDate = formatNoteDate(note.updatedAt);

  return (
    <div
      onClick={() => onSelect(note)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(note);
        }
      }}
      className={`group relative text-left p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
        isSelected
          ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-400 dark:border-blue-600 shadow-xs'
          : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4
          className={`font-semibold text-sm line-clamp-1 ${
            isSelected
              ? 'text-blue-950 dark:text-blue-100'
              : 'text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'
          }`}
        >
          {note.title.trim() ? note.title : 'Untitled Note'}
        </h4>

        <div className="flex items-center gap-1 shrink-0">
          {note.isPinned && (
            <span
              title="Pinned note"
              className="p-1 rounded text-amber-500 bg-amber-50 dark:bg-amber-950/40"
            >
              <Pin className="w-3 h-3 fill-amber-500" />
            </span>
          )}
          {note.isArchived && (
            <span
              title="Archived"
              className="p-1 rounded text-slate-400 bg-slate-100 dark:bg-slate-800"
            >
              <Archive className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
        {snippet}
      </p>

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-400 dark:text-slate-500">
        <span className="font-mono text-[10px]">{formattedDate}</span>

        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-1 overflow-hidden">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium truncate max-w-[120px]">
              <Tag className="w-2.5 h-2.5 shrink-0" />
              #{note.tags[0]}
            </span>
            {note.tags.length > 1 && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                +{note.tags.length - 1}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

