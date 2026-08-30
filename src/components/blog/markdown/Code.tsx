import { cn } from "@/lib/cn";
import { getTextContent } from "./utils";
import { CopyCodeButton } from "./CopyCodeButton";
import type { MarkdownComponentProps } from "./types";

/**
 * Inline and block code component. Server-rendered: the only interactive part
 * of a code block is the copy button, which is its own client island.
 */
export const Code = ({ className, children }: MarkdownComponentProps) => {
  const isInline = !className || !className.includes("language-");

  return (
    <code
      className={cn(
        isInline
          ? "rounded bg-muted px-1.5 md:px-2 py-0.5 text-xs md:text-sm font-mono text-primary before:content-none after:content-none"
          : "block text-xs md:text-sm font-mono my-0",
        className
      )}
    >
      {children}
    </code>
  );
};

/**
 * Pre/code block wrapper with one-click copy. The raw code text is extracted on
 * the server and handed to the client copy button as a string, so nothing but
 * that button crosses to the client.
 */
export const Pre = ({ children, className }: MarkdownComponentProps) => (
  <div className="code-block-wrap">
    <pre
      className={cn(
        "mb-4 md:mb-6 rounded-lg bg-muted border border-primary/15 p-3 md:p-4 lg:p-6 overflow-x-auto relative text-xs md:text-sm",
        className
      )}
      style={{ boxShadow: "none" }}
    >
      {children}
    </pre>
    <CopyCodeButton code={getTextContent(children)} />
  </div>
);
