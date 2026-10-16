'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import { safeSanitizeSchema, isExternalUrl } from '@/lib/markdown';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  onCheckboxChange?: (index: number, checked: boolean) => void;
}

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  if (!content || content.trim() === '') {
    return (
      <div className={`text-slate-400 dark:text-slate-500 italic py-8 text-center text-sm ${className}`}>
        No content to preview
      </div>
    );
  }

  return (
    <div
      className={`prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-code:before:content-none prose-code:after:content-none prose-table:border prose-table:border-slate-200 dark:prose-table:border-slate-700 ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [rehypeSanitize, safeSanitizeSchema],
          [rehypeHighlight, { ignoreMissing: true }],
        ]}
        components={{
          pre: ({ children, ...props }) => (
            <pre
              className="p-4 rounded-xl my-4 overflow-x-auto text-sm font-mono leading-relaxed bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800"
              {...props}
            >
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = /language-(\w+)/.test(className || '') || className?.includes('hljs');
            if (!isBlock) {
              return (
                <code
                  className="text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded-md text-xs font-mono font-medium"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className={`${className || ''} bg-transparent! p-0 text-inherit text-sm font-mono`}
                {...props}
              >
                {children}
              </code>
            );
          },
          a: ({ href, children, ...props }) => {
            const isExternal = href ? isExternalUrl(href) : false;
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                {...props}
              >
                {children}
              </a>
            );
          },
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-sm" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th
              className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700"
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td
              className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              {...props}
            >
              {children}
            </td>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-4 border-blue-500/80 dark:border-blue-400/80 bg-blue-50/50 dark:bg-blue-950/20 px-4 py-2 my-4 rounded-r text-slate-700 dark:text-slate-300 italic"
              {...props}
            >
              {children}
            </blockquote>
          ),
          ul: ({ children, ...props }) => {
            return (
              <ul className="list-disc pl-5 my-2 space-y-1" {...props}>
                {children}
              </ul>
            );
          },
          ol: ({ children, ...props }) => {
            return (
              <ol className="list-decimal pl-5 my-2 space-y-1" {...props}>
                {children}
              </ol>
            );
          },
          input: ({ type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2 h-4 w-4 align-middle"
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
