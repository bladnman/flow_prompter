'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef } from 'react';

// Convert plain text with newlines to HTML paragraphs for TipTap
function textToHtml(text: string): string {
  if (!text) return '<p></p>';
  // Split by newlines and wrap each line in a paragraph
  // Empty lines become empty paragraphs (no <br> needed - causes doubling)
  return text
    .split('\n')
    .map((line) => `<p>${escapeHtml(line) || ''}</p>`)
    .join('');
}

// Escape HTML entities to prevent XSS and ensure text is treated as text
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  minHeight?: string;
  borderless?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your prompt here...',
  disabled = false,
  readOnly = false,
  className = '',
  minHeight = '200px',
  borderless = false,
}: MarkdownEditorProps) {
  // Track the last value we set to avoid unnecessary updates
  const lastSetValue = useRef<string>(value);
  const isInternalChange = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: textToHtml(value),
    editable: !disabled && !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      isInternalChange.current = true;
      lastSetValue.current = text;
      onChange(text);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none`,
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // Update content when value changes externally (not from typing)
  useEffect(() => {
    console.log('[MarkdownEditor] Effect running:', {
      hasEditor: !!editor,
      isInternalChange: isInternalChange.current,
      value: value?.slice(0, 50),
      lastSetValue: lastSetValue.current?.slice(0, 50),
      valueChanged: value !== lastSetValue.current,
    });

    if (!editor) return;

    // Skip if this change came from internal editing
    if (isInternalChange.current) {
      isInternalChange.current = false;
      console.log('[MarkdownEditor] Skipping - internal change');
      return;
    }

    // Only update if value actually changed from what we last set
    if (value !== lastSetValue.current) {
      console.log('[MarkdownEditor] Updating editor content');
      lastSetValue.current = value;
      editor.commands.setContent(textToHtml(value));
    } else {
      console.log('[MarkdownEditor] Skipping - value unchanged');
    }
  }, [editor, value]);

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled && !readOnly);
    }
  }, [editor, disabled, readOnly]);

  return (
    <div
      className={`
        ${borderless ? '' : 'border border-neutral-200 rounded-lg focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-transparent'}
        overflow-hidden
        ${disabled ? 'bg-neutral-50 cursor-not-allowed' : readOnly ? 'bg-neutral-50/50' : 'bg-white'}
        ${className}
      `}
    >
      <EditorContent
        editor={editor}
        className={`
          p-4
          [&_.ProseMirror]:min-h-[${minHeight}]
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-neutral-400
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
        `}
      />
    </div>
  );
}
