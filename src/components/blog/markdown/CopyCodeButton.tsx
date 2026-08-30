"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * The single interactive island in the otherwise server-rendered markdown tree.
 * It receives the code as a plain string prop, so `Pre` and the whole markdown
 * pipeline (react-markdown, rehype-highlight, highlight.js) stay on the server
 * and never ship to the browser.
 */
export const CopyCodeButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "copied" : "copy code"}
      className="copy-code-btn inline-flex items-center gap-1.5"
    >
      {copied ? (
        <>
          <Check className="size-3" aria-hidden="true" /> copied
        </>
      ) : (
        <>
          <Copy className="size-3" aria-hidden="true" /> copy
        </>
      )}
    </button>
  );
};
