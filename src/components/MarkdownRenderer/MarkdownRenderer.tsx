'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div
      className={`
        prose prose-sm max-w-none
        prose-headings:text-neutral-900
        prose-p:text-neutral-700
        prose-code:text-neutral-800 prose-code:bg-neutral-100 prose-code:px-1 prose-code:rounded
        prose-pre:bg-neutral-900 prose-pre:text-neutral-100
        prose-a:text-violet-600
        prose-li:text-neutral-700
        ${className}
      `}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{content}</ReactMarkdown>
    </div>
  );
}
