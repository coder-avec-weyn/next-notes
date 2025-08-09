"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./loading-spinner";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <LoadingSpinner size="sm" />,
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  readOnly?: boolean;
  id?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  className,
  minHeight = "200px",
  readOnly = false,
  id,
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link"],
      ["clean"],
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link",
  ];

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        style={{ minHeight }}
      >
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rich-text-editor",
        isFocused && "ring-2 ring-ring ring-offset-1",
        className,
      )}
      style={{ minHeight }}
    >
      <style jsx global>{`
        .rich-text-editor .ql-container {
          font-size: 0.875rem;
          font-family: inherit;
          min-height: ${minHeight};
          border: none;
          background-color: transparent;
        }
        .rich-text-editor .ql-editor {
          min-height: ${minHeight};
          max-height: 500px;
          overflow-y: auto;
          padding: 0.5rem 0;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: var(--muted-foreground);
          font-style: normal;
        }
        .rich-text-editor .ql-toolbar {
          border: none;
          border-bottom: 1px solid var(--border);
          padding: 0.5rem 0;
          background-color: transparent;
        }
        .rich-text-editor .ql-toolbar button {
          height: 24px;
          width: 24px;
          padding: 2px;
        }
        .rich-text-editor .ql-toolbar button:hover {
          color: var(--primary);
        }
        .rich-text-editor .ql-toolbar .ql-active {
          color: var(--primary);
        }
        .rich-text-editor .ql-formats {
          margin-right: 8px;
        }
        .rich-text-editor .ql-tooltip {
          z-index: 50;
        }
      `}</style>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        id={id}
      />
    </div>
  );
}
