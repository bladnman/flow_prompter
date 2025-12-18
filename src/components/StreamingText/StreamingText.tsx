'use client';

import { useEffect, useRef } from 'react';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';

interface StreamingTextProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
  autoScroll?: boolean;
}

export function StreamingText({
  content,
  isStreaming = false,
  className = '',
  autoScroll = true,
}: StreamingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when streaming
  useEffect(() => {
    if (autoScroll && isStreaming && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content, isStreaming, autoScroll]);

  return (
    <div
      ref={containerRef}
      className={`
        overflow-auto
        ${className}
      `}
    >
      <MarkdownRenderer content={content} />
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-violet-500 animate-pulse ml-1" />
      )}
    </div>
  );
}
