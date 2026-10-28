'use client';

import React from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Strikethrough,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  FileCode,
  Link as LinkIcon,
  Table as TableIcon,
  Minus,
  Columns2,
  Edit3,
  Eye,
} from 'lucide-react';
import type { MonacoEditorInstance } from '@/components/MonacoEditorPane';

export type EditorViewMode = 'split' | 'edit' | 'preview';

interface MarkdownToolbarProps {
  editorRef?: React.MutableRefObject<MonacoEditorInstance | null>;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  content: string;
  onChange: (value: string) => void;
  viewMode: EditorViewMode;
  onViewModeChange: (mode: EditorViewMode) => void;
}

export function MarkdownToolbar({
  editorRef,
  textareaRef,
  content,
  onChange,
  viewMode,
  onViewModeChange,
}: MarkdownToolbarProps) {
  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    // 1. Monaco Editor Native Insertion
    if (editorRef?.current) {
      const editor = editorRef.current;
      const selection = editor.getSelection();
      if (!selection) return;

      const model = editor.getModel();
      if (!model) return;

      const selectedText = model.getValueInRange(selection) || defaultText;
      const replacement = `${prefix}${selectedText}${suffix}`;

      editor.executeEdits('toolbar-format', [
        {
          range: selection,
          text: replacement,
          forceMoveMarkers: true,
        },
      ]);

      // If text was empty, position cursor inside prefix & suffix
      if (!model.getValueInRange(selection)) {
        const startColumn = selection.startColumn + prefix.length;
        const endColumn = startColumn + defaultText.length;
        editor.setSelection({
          startLineNumber: selection.startLineNumber,
          startColumn: startColumn,
          endLineNumber: selection.endLineNumber,
          endColumn: endColumn,
        });
      }

      editor.focus();
      return;
    }

    // 2. Textarea Fallback
    const textarea = textareaRef?.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  const insertLinePrefix = (prefix: string, defaultText: string = '') => {
    // 1. Monaco Editor Native Line Prefix
    if (editorRef?.current) {
      const editor = editorRef.current;
      const selection = editor.getSelection();
      if (!selection) return;

      const model = editor.getModel();
      if (!model) return;

      const lineNumber = selection.startLineNumber;
      const lineContent = model.getLineContent(lineNumber);

      if (lineContent.trim() === '' && defaultText) {
        editor.executeEdits('toolbar-prefix', [
          {
            range: {
              startLineNumber: lineNumber,
              startColumn: 1,
              endLineNumber: lineNumber,
              endColumn: lineContent.length + 1,
            },
            text: `${prefix}${defaultText}`,
            forceMoveMarkers: true,
          },
        ]);
      } else {
        editor.executeEdits('toolbar-prefix', [
          {
            range: {
              startLineNumber: lineNumber,
              startColumn: 1,
              endLineNumber: lineNumber,
              endColumn: 1,
            },
            text: prefix,
            forceMoveMarkers: true,
          },
        ]);
      }

      editor.focus();
      return;
    }

    // 2. Textarea Fallback
    const textarea = textareaRef?.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = content.substring(0, start);
    const lastNewline = textBefore.lastIndexOf('\n');
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const lineText = content.substring(lineStart, end);
    const selected = lineText || defaultText;

    const newContent =
      content.substring(0, lineStart) +
      prefix +
      selected +
      content.substring(end);

    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        lineStart + prefix.length + selected.length,
        lineStart + prefix.length + selected.length
      );
    }, 10);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
      {/* Formatting Tools */}
      <div className="flex flex-wrap items-center gap-0.5">
        <button
          type="button"
          onClick={() => insertFormatting('**', '**', 'bold text')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('*', '*', 'italic text')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('~~', '~~', 'strikethrough text')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        <button
          type="button"
          onClick={() => insertLinePrefix('# ', 'Heading 1')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertLinePrefix('## ', 'Heading 2')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertLinePrefix('### ', 'Heading 3')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        <button
          type="button"
          onClick={() => insertLinePrefix('- ', 'List item')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertLinePrefix('1. ', 'Numbered item')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertLinePrefix('- [ ] ', 'Task to do')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Task List"
        >
          <CheckSquare className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertLinePrefix('> ', 'Quote text')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        <button
          type="button"
          onClick={() => insertFormatting('`', '`', 'inline code')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('```\n', '\n```', 'code block')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Code Block"
        >
          <FileCode className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('[', '](https://example.com)', 'Link text')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Hyperlink"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            insertFormatting(
              '\n| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n'
            )
          }
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('\n---\n')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* View Mode Switcher */}
      <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800/80 p-0.5 rounded-md">
        <button
          type="button"
          onClick={() => onViewModeChange('edit')}
          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
            viewMode === 'edit'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Editor only"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Write</span>
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('split')}
          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
            viewMode === 'split'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Side-by-side split view"
        >
          <Columns2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Split</span>
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('preview')}
          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
            viewMode === 'preview'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Preview rendered Markdown"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </button>
      </div>
    </div>
  );
}
