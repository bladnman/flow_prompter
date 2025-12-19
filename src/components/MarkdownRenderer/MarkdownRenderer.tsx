'use client';

import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Custom components for markdown rendering
const markdownComponents: Components = {
  hr: () => (
    <hr className="my-6 border-0 border-t border-neutral-300 dark:border-neutral-600" />
  ),
  // Style other elements that need dark mode support
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-4 mb-2">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-3 mb-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mt-3 mb-1">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-neutral-700 dark:text-neutral-300 mb-2 last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-neutral-900 dark:text-neutral-100">{children}</strong>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-violet-600 dark:text-violet-400 hover:underline">{children}</a>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 text-neutral-700 dark:text-neutral-300 mb-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 text-neutral-700 dark:text-neutral-300 mb-2">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-neutral-700 dark:text-neutral-300">{children}</li>
  ),
  code: ({ children, className }) => {
    // Check if this is a code block (has language class) or inline code
    const isCodeBlock = className?.includes('language-');
    if (isCodeBlock) {
      return (
        <code className={`${className} block bg-neutral-900 text-neutral-100 p-3 rounded overflow-x-auto`}>
          {children}
        </code>
      );
    }
    return (
      <code className="text-neutral-800 dark:text-neutral-200 bg-neutral-200 dark:bg-neutral-700 px-1 py-0.5 rounded text-sm">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-neutral-900 text-neutral-100 p-3 rounded overflow-x-auto mb-2">{children}</pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-neutral-300 dark:border-neutral-600 pl-4 italic text-neutral-600 dark:text-neutral-400 my-2">
      {children}
    </blockquote>
  ),
};

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
