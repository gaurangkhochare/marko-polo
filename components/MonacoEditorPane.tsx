'use client';

import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor as MonacoEditorType } from 'monaco-editor';
import { useTheme } from '@/components/ThemeProvider';

export type MonacoEditorInstance = MonacoEditorType.IStandaloneCodeEditor;

interface MonacoEditorPaneProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  editorRef?: React.RefObject<MonacoEditorInstance | null>;
  className?: string;
}

export function MonacoEditorPane({
  value,
  onChange,
  onSave,
  editorRef,
  className = '',
}: MonacoEditorPaneProps) {
  const { isDark } = useTheme();
  const internalEditorRef = useRef<MonacoEditorInstance | null>(null);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    internalEditorRef.current = editor;
    if (editorRef) {
      editorRef.current = editor;
    }

    // Register Ctrl+S / Cmd+S save shortcut inside Monaco editor
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSaveRef.current) {
        onSaveRef.current();
      }
    });

    // Define sleek custom themes matching Marko Polo palette
    monaco.editor.defineTheme('marko-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '7c3aed' },
        { token: 'string', foreground: '047857' },
        { token: 'number', foreground: 'b45309' },
        { token: 'type', foreground: '0369a1' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#0f172a',
        'editor.lineHighlightBackground': '#ffffff',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#0f172a',
        'editorCursor.foreground': '#2563eb',
        'editor.selectionBackground': '#bfdbfe',
      },
    });

    monaco.editor.defineTheme('marko-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '94a3b8', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c084fc' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'fbbf24' },
        { token: 'type', foreground: '60a5fa' },
      ],
      colors: {
        'editor.background': '#0f172a',
        'editor.foreground': '#f1f5f9',
        'editor.lineHighlightBackground': '#0f172a',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#f1f5f9',
        'editorCursor.foreground': '#60a5fa',
        'editor.selectionBackground': '#1e3a8a',
      },
    });

    monaco.editor.setTheme(isDark ? 'marko-dark' : 'marko-light');
  };

  // Sync theme changes dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as unknown as { monaco?: typeof import('monaco-editor') }).monaco) {
      (window as unknown as { monaco: typeof import('monaco-editor') }).monaco.editor.setTheme(
        isDark ? 'marko-dark' : 'marko-light'
      );
    }
  }, [isDark]);

  return (
    <div className={`w-full h-full min-w-0 min-h-0 relative ${className}`}>
      <Editor
        height="100%"
        width="100%"
        defaultLanguage="markdown"
        language="markdown"
        theme={isDark ? 'marko-dark' : 'marko-light'}
        value={value}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorDidMount}
        loading={
          <div className="h-full w-full flex items-center justify-center bg-white dark:bg-slate-900 text-slate-400 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading Monaco Editor...</span>
            </div>
          </div>
        }
        options={{
          wordWrap: 'on',
          lineNumbers: 'on',
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily:
            'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          renderLineHighlight: 'all',
          renderWhitespace: 'none',
          padding: { top: 16, bottom: 16 },
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          quickSuggestions: false,
          folding: true,
          glyphMargin: false,
          lineDecorationsWidth: 6,
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          contextmenu: true,
        }}
      />
    </div>
  );
}

export default MonacoEditorPane;
