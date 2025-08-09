"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./loading-spinner";
import { TooltipProvider } from "./tooltip";
import { motion } from "framer-motion";

// Dynamic import of ReactQuill with loading state
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <LoadingSpinner size="sm" />,
});

// Define custom icons for the toolbar
const customIcons = {
  header: {
    "1": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h12"/></svg>',
    "2": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"/><path d="M4 6h8"/><path d="M4 18h8"/></svg>',
  },
  bold: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>',
  italic:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>',
  underline:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>',
  strike:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" y1="12" x2="20" y2="12"/></svg>',
  list: {
    ordered:
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>',
    bullet:
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>',
  },
  blockquote:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>',
  "code-block":
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  link: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  clean:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
  align: {
    "": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    center:
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    right:
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y极="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    justify:
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  },
};

// Tooltip descriptions for editor tools
const tooltips = {
  header: "Heading style",
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strike: "Strikethrough",
  orderedList: "Numbered list",
  bulletList: "Bullet list",
  blockquote: "Quote",
  codeBlock: "Code block",
  link: "Insert link",
  // color: "Text color",
  // background: "Background color",
  align: "Text alignment",
  clean: "Clear formatting",
};

// Define color palettes for text and background
const colorPalette = [
  "#000000",
  "#e60000",
  "#ff9900",
  "#ffff00",
  "#008a00",
  "#0066cc",
  "#9933cc",
  "#ffffff",
  "#facccc",
  "#ffebcc",
  "#ffffcc",
  "#cce8cc",
  "#cce0f5",
  "#ebd6ff",
  "#bbbbbb",
  "#f06666",
  "#ffc266",
  "#ffff66",
  "#66b966",
  "#66a3e0",
  "#c285ff",
  "#888888",
  "#a10000",
  "#b26b00",
  "#b2b200",
  "#006100",
  "#0047b2",
  "#6b24b2",
  "#444444",
  "#5c0000",
  "#663d00",
  "#666600",
  "#003700",
  "#002966",
  "#3d1466",
];

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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
    }
    return () => setMounted(false);
  }, []);

  // Register custom icons properly
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      const Quill = require("react-quill").Quill;
      const icons = Quill.import("ui/icons");

      Object.entries(customIcons).forEach(([key, value]) => {
        if (typeof value === "object") {
          Object.entries(value).forEach(([subKey, svg]) => {
            icons[key][subKey] = svg;
          });
        } else {
          icons[key] = value;
        }
      });
    }
  }, [mounted]);

  // Fix for static dropdowns - remove ql-expanded class
  useEffect(() => {
    if (mounted) {
      // const fixStaticDropdowns = () => {
      //   document
      //     .querySelectorAll(".ql-color-picker, .ql-background")
      //     .forEach((picker) => {
      //       picker.classList.remove("ql-expanded");
      //     });
      // };
      // Run immediately and after a short delay
      // fixStaticDropdowns();
      // const timer = setTimeout(fixStaticDropdowns, 500);
      // return () => clearTimeout(timer);
    }
  }, [mounted]);

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "code-block"],
        ["link"],
        [{ color: colorPalette }],
        [{ align: [] }],
        ["clean"],
      ],
    },
    clipboard: {
      matchVisual: false,
    },
    history: {
      delay: 1000,
      maxStack: 50,
      userOnly: true,
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
    "color",
    "background",
    "align",
  ];

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex items-center justify-center w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        style={{ minHeight }}
      >
        <LoadingSpinner size="sm" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading editor...
        </span>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "rich-text-editor",
        isFocused && "ring-1 ring-primary ring-offset-1",
        className,
      )}
      style={{ minHeight }}
      initial={{ opacity: 0.9, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
    >
      <style jsx global>{`
        .rich-text-editor {
          border-radius: 0.5rem;
          overflow: hidden;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          background-color: var(--background);
          position: relative;
        }

        .rich-text-editor:hover {
          box-shadow: 0 2极 6px rgba(0, 0, 0, 0.08);
        }

        /* Container styles */
        .rich-text-editor .ql-container {
          font-size: 0.9375rem;
          font-family: inherit;
          min-height: ${minHeight};
          border: none;
          background-color: transparent;
          line-height: 1.6;
        }

        /* Editor area styles */
        .rich-text-editor .ql-editor {
          min-height: ${minHeight};
          max-height: 500px;
          overflow-y: auto;
          padding: 1.25rem 1rem;
          color: var(--foreground);
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
          letter-spacing: -0.011em;
        }

        /* Custom scrollbar */
        .rich-text-editor .ql-editor::-webkit-scrollbar {
          width: 6px;
        }

        .rich-text-editor .ql-editor::-webkit-scrollbar-track {
          background: transparent;
        }

        .rich-text-editor .ql-editor::-webkit-scrollbar-thumb {
          background-color: var(--border);
          border-radius: 6px;
        }

        /* Placeholder styles */
        .rich-text-editor .ql-editor.ql-blank::before {
          color: var(--muted-foreground);
          font-style: normal;
          font-size: 0.9375rem;
          opacity: 0.6;
          font-weight: 400;
        }

        /* Toolbar styles */
        .rich-text-editor .ql-toolbar {
          border: none;
          border-bottom: 1px solid var(--border);
          padding: 0.625rem 0.75rem;
          background-color: var(--card);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 4px;
          justify-content: flex-start;
        }

        /* Toolbar button styles */
        .rich-text-editor .ql-toolbar button {
          height: 32px;
          width: 32px;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        /* Button hover effects */
        .rich-text-editor .ql-toolbar button:hover {
          background-color: var(--accent);
          color: var(--accent-foreground);
          transform: translateY(-1px);
        }

        /* Button active state */
        .rich-text-editor .ql-toolbar button:active {
          transform: translateY(1px);
        }

        /* SVG icon improvements */
        .rich-text-editor .ql-toolbar button svg {
          width: 18px;
          height: 18px;
          stroke-width: 1.75px;
          stroke: currentColor;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* Tooltip styles */
        .rich-text-editor .ql-toolbar button[data-tooltip]:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--primary);
          color: var(--primary-foreground);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          white-space: nowrap;
          z-index: 10;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          pointer-events: none;
          opacity: 0;
          animation: fadeIn 0.2s ease forwards;
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        /* Dropdown picker styles */
        .rich-text-editor .ql-toolbar .ql-picker-label {
          padding: 0 8px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          height: 32px;
          font-size: 0.875rem;
          transition: all 0.15s ease;
        }

        .rich-text-editor .ql-toolbar .ql-picker-label:hover {
          background-color: var(--accent);
          color: var(--accent-foreground);
        }

        /* Dropdown arrow icon */
        .rich-text-editor .ql-toolbar .ql-picker-label svg {
          width: 14px;
          height: 14px;
          margin-left: 6px;
          stroke-width: 2px;
        }

        /* Picker container */
        .rich-text-editor .ql-toolbar .ql-picker {
          height: 32px;
          margin-right: 4px;
          position: relative;
        }

        /* Dropdown menu - FIXED: Proper display handling */
        .ql-picker-options {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 4px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          padding: 6px;
          background-color: var(--background);
          border: 1px solid var(--border);
          animation: scaleIn 0.15s ease-out;
          transform-origin: top center;
          z-index: 20;
        }

        /* Show dropdown only when expanded */
        .rich-text-editor
          .ql-toolbar
          .ql-picker.ql-expanded
          .ql-picker-options {
          display: block;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Dropdown items */
        .rich-text-editor .ql-toolbar .ql-picker-item {
          padding: 6px 10px;
          border-radius: 4px;
          transition: all 0.1s ease;
          display: block;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .rich-text-editor .ql-toolbar .ql-picker-item:hover {
          background-color: var(--accent);
          color: var(--accent-foreground);
        }

        /* Active state for all controls */
        .rich-text-editor .ql-toolbar .ql-active {
          background-color: var(--primary) !important;
          color: var(--primary-foreground) !important;
        }

        /* Format groups */
        .rich-text-editor .ql-formats {
          margin-right: 8px;
          display: flex;
          align-items: center;
          position: relative;
        }

        /* Add subtle separators between groups */
        .rich-text-editor .ql-formats:not(:last-child)::after {
          content: "";
          position: absolute;
          right: -4px;
          top: 20%;
          height: 60%;
          width: 1px;
          background-color: var(--border);
          opacity: 0.6;
        }

        /* Link tooltip */
        .rich-text-editor .ql-tooltip {
          z-index: 50;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          padding: 12px;
          background-color: var(--background);
          border: 1px solid var(--border);
          animation: fadeIn 0.2s ease;
        }

        /* Link input field */
        .rich-text-editor .ql-tooltip input[type="text"] {
          border-radius: 6px;
          border: 1px solid var(--border);
          padding: 6px 10px;
          margin: 0 8px;
          font-size: 0.875rem;
          width: 240px;
          transition: border-color 0.15s ease;
        }

        .rich-text-editor .ql-tooltip input[type="text"]:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px var(--primary-foreground-10);
        }

        /* Link action buttons */
        .rich-text-editor .ql-tooltip a.ql-action,
        .rich-text-editor .ql-tooltip a.ql-remove {
          padding: 6px 12px;
          border-radius: 6px;
          background-color: var(--primary);
          color: var(--primary-foreground);
          font-size: 0.8125rem;
          text-decoration: none;
          margin-left: 8px;
          transition: all 0.15s ease;
          display: inline-block;
        }

        .rich-text-editor .ql-tooltip a.ql-action:hover,
        .rich-text-editor .ql-t极tip a.ql-remove:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .rich-text-editor .ql-tooltip a.ql-action:active,
        .rich-text-editor .ql-tooltip a.ql-remove:active {
          transform: translateY(1px);
        }

        .rich-text-editor .ql-tooltip a.ql-remove {
          background-color: var(--destructive);
          color: var(--destructive-foreground);
        }

        /* Color picker improvements */
        .rich-text-editor .ql-color-picker,
        .rich-text-editor .ql-background {
          width: auto !important;
        }

        .rich-text-editor .ql-color-picker .ql-picker-label,
        .rich-text-editor .ql-background .ql-picker-label {
          padding: 0 !important;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rich-text-editor .ql-color-picker .ql-picker-options,
        .rich-text-editor .ql-background .ql-picker-options {
          padding: 8px;
          width: 210px !important;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 4px;
        }

        .rich-text-editor .ql-color-picker .ql-picker-item,
        .rich-text-editor .ql-background .ql-picker-item {
          width: 24px !important;
          height: 24px !important;
          border-radius: 4px;
          margin: 2px;
          border: 1px solid var(--border);
          transition: transform 0.15s ease;
          cursor: pointer;
        }

        .rich-text-editor .ql-color-picker .ql-picker-item:hover,
        .rich-text-editor .ql-background .ql-picker-item:hover {
          transform: scale(1.15);
          border-color: var(--primary);
        }

        /* Improved content formatting */
        .rich-text-editor .ql-editor h1 {
          font-size: 1.875rem;
          margin-top: 1.75rem;
          margin-bottom: 0.875rem;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.025em;
        }

        .rich-text-editor .ql-editor h2 {
          font-size: 1.5rem;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
          line-height: 1.3;
          letter-spacing: -0.02em;
        }

        .rich-text-editor .ql-editor h3 {
          font-size: 1.25rem;
          margin-top: 1.25rem;
          margin-bottom: 0.625rem;
          font-weight: 600;
          line-height: 1.4;
          letter-spacing: -0.015em;
        }

        .rich-text-editor .ql-editor p {
          margin-bottom: 0.875rem;
          line-height: 1.6;
        }

        /* Blockquote styling */
        .rich-text-editor .ql-editor blockquote {
          border-left: 3px solid var(--primary);
          padding: 0.5rem 0 0.5rem 1.25rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: var(--muted-foreground);
          background-color: var(--accent);
          border-radius: 0 6px 6px 0;
        }

        /* Code styling */
        .rich-text-editor .ql-editor code {
          background-color: var(--muted);
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            monospace;
          font-size: 0.9em;
          color: var(--primary);
        }

        /* Code block styling */
        .rich-text-editor .ql-editor pre {
          background-color: var(--muted);
          border-radius: 8px;
          padding: 1.25rem;
          margin: 1.25rem 0;
          overflow-x: auto;
          border: 1px solid var(--border);
        }

        .rich-text-editor .ql-editor pre code {
          background-color: transparent;
          padding: 0;
          border-radius: 0;
          color: inherit;
          font-size: 0.875rem;
          line-height: 1.7;
        }

        /* List styling */
        .rich-text-editor .ql-editor ul,
        .rich-text-editor .ql-editor ol {
          padding-left: 1.75rem;
          margin: 1rem 0 1.25rem;
        }

        .rich-text-editor .ql-editor li {
          margin-bottom: 0.375rem;
          position: relative;
        }

        /* Link styling */
        .rich-text-editor .ql-editor a {
          color: var(--primary);
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: all 0.15s ease;
        }

        .rich-text-editor .ql-editor a:hover {
          opacity: 0.8;
          text-decoration-thickness: 2px;
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .rich-text-editor .ql-toolbar {
            padding: 0.5rem;
            gap: 2px;
            flex-wrap: wrap;
            justify-content: center;
          }

          .rich-text-editor .ql-toolbar button {
            height: 30px;
            width: 30px;
            padding: 5px;
          }

          .rich-text-editor .ql-formats:not(:last-child)::after {
            display: none;
          }

          .rich-text-editor .ql-formats {
            margin-right: 4px;
          }
        }
      `}</style>
      <TooltipProvider>
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
          bounds=".rich-text-editor"
        />
      </TooltipProvider>
    </motion.div>
  );
}
