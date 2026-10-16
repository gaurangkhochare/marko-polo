'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Pin,
  Archive,
  ArchiveRestore,
  Trash2,
  Check,
  AlertCircle,
  Clock,
  ArrowLeft,
  Tag as TagIcon,
  X,
  Save,
} from 'lucide-react';
import { MarkdownToolbar, EditorViewMode } from '@/components/MarkdownToolbar';
import { MarkdownPreview } from '@/components/MarkdownPreview';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { INote } from '@/types';

interface NoteEditorProps {
  note: INote | null;
  onUpdateNote: (updated: Partial<INote> & { _id: string }) => Promise<boolean>;
  onDeleteNote: (noteId: string) => Promise<boolean>;
  onBackToList?: () => void;
}

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export function NoteEditor({
  note,
  onUpdateNote,
  onDeleteNote,
  onBackToList,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [isArchived, setIsArchived] = useState(note?.isArchived || false);

  const [viewMode, setViewMode] = useState<EditorViewMode>('split');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Perform save operation
  const saveChanges = useCallback(
    async (overrideFields?: Partial<INote>) => {
      if (!note) return;

      setSaveStatus('saving');
      setErrorMessage(null);

      const payload: Partial<INote> & { _id: string } = {
        _id: note._id,
        title: overrideFields?.title !== undefined ? overrideFields.title : title.trim() || 'Untitled Note',
        content: overrideFields?.content !== undefined ? overrideFields.content : content,
        tags: overrideFields?.tags !== undefined ? overrideFields.tags : tags,
        isPinned: overrideFields?.isPinned !== undefined ? overrideFields.isPinned : isPinned,
        isArchived: overrideFields?.isArchived !== undefined ? overrideFields.isArchived : isArchived,
      };

      const success = await onUpdateNote(payload);
      if (success) {
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
        setErrorMessage('Failed to save changes. Please retry.');
      }
    },
    [note, title, content, tags, isPinned, isArchived, onUpdateNote]
  );

  // Trigger autosave when title or content change (with debouncing)
  const triggerAutosave = useCallback(() => {
    setSaveStatus('unsaved');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveChanges();
    }, 1000);
  }, [saveChanges]);

  // Handle Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        saveChanges();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveChanges]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    triggerAutosave();
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    triggerAutosave();
  };

  const handleTogglePin = async () => {
    const nextPinned = !isPinned;
    setIsPinned(nextPinned);
    await saveChanges({ isPinned: nextPinned });
  };

  const handleToggleArchive = async () => {
    const nextArchived = !isArchived;
    setIsArchived(nextArchived);
    await saveChanges({ isArchived: nextArchived });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = newTagInput.trim().replace(/^#/, '');
      if (cleaned && !tags.includes(cleaned) && tags.length < 20) {
        const nextTags = [...tags, cleaned];
        setTags(nextTags);
        setNewTagInput('');
        saveChanges({ tags: nextTags });
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const nextTags = tags.filter((t) => t !== tagToRemove);
    setTags(nextTags);
    saveChanges({ tags: nextTags });
  };

  const handleDeleteConfirm = async () => {
    if (!note) return;
    setIsDeleting(true);
    await onDeleteNote(note._id);
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
  };

  if (!note) {
    return (
      <div className="h-full w-full flex-1 min-w-0 flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-900">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
          <Save className="w-8 h-8 stroke-1" />
        </div>
        <p className="text-base font-medium text-slate-700 dark:text-slate-300">
          No note selected
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
          Select a note from the list on the left, or create a new note to start writing.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full flex-1 min-w-0 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Top Action Bar */}
      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="md:hidden p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              aria-label="Back to notes list"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Save Status Badge */}
          <div className="flex items-center gap-1.5 text-xs">
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Saved</span>
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <button
                type="button"
                onClick={() => saveChanges()}
                className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium hover:underline cursor-pointer"
                title="Click to save now (Ctrl+S)"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Unsaved changes</span>
              </button>
            )}
            {saveStatus === 'error' && (
              <button
                type="button"
                onClick={() => saveChanges()}
                className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium hover:underline cursor-pointer"
                title={errorMessage || 'Click to retry'}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Save error (Retry)</span>
              </button>
            )}
          </div>
        </div>

        {/* Note Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleTogglePin}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              isPinned
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleToggleArchive}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              isArchived
                ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isArchived ? 'Restore note from archive' : 'Archive note'}
          >
            {isArchived ? (
              <ArchiveRestore className="w-4 h-4" />
            ) : (
              <Archive className="w-4 h-4" />
            )}
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
            title="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title & Tags Header */}
      <div className="px-6 pt-5 pb-3 space-y-3">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Note"
          maxLength={200}
          className="w-full text-2xl sm:text-3xl font-bold tracking-tight bg-transparent border-0 focus:outline-hidden text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
        />

        {/* Tags input bar */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            >
              <TagIcon className="w-3 h-3 text-slate-400" />
              <span>{t}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(t)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {tags.length < 20 && (
            <div className="inline-flex items-center">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="+ tag (press Enter)"
                className="px-2 py-1 text-xs bg-transparent border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Formatting Toolbar */}
      <MarkdownToolbar
        textareaRef={textareaRef}
        content={content}
        onChange={handleContentChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Editor & Preview Area */}
      <div className="flex-1 flex w-full min-w-0 overflow-hidden">
        {/* Editor Pane */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div
            className={`flex-1 h-full min-w-0 p-4 overflow-y-auto ${
              viewMode === 'split' ? 'border-r border-slate-200 dark:border-slate-800' : ''
            }`}
          >
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start writing markdown here... Use the toolbar above for formatting or write raw markdown syntax."
              className="w-full h-full min-h-[400px] resize-none bg-transparent font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden"
              spellCheck="false"
            />
          </div>
        )}

        {/* Live Preview Pane */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="flex-1 h-full min-w-0 p-6 overflow-y-auto bg-slate-50/40 dark:bg-slate-900/40">
            <MarkdownPreview content={content} />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        noteTitle={title}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}

