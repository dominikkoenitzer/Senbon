import { cn } from "@/lib/utils";
import type { MarkdownComponentProps } from "./types";

/**
 * Table wrapper with horizontal scroll
 */
export const TableWrapper = ({ className, children }: MarkdownComponentProps) => (
  <div className="my-4 md:my-6 lg:my-8 overflow-x-auto -mx-2 md:mx-0">
    <table
      className={cn(
        "w-full border-collapse border border-white/5 rounded-lg overflow-hidden backdrop-blur-sm text-xs md:text-sm lg:text-base",
        className
      )}
    >
      {children}
    </table>
  </div>
);

/**
 * Table head component
 */
export const Thead = ({ className, children }: MarkdownComponentProps) => (
  <thead className={cn("bg-white/5", className)}>
    {children}
  </thead>
);

/**
 * Table header cell
 */
export const Th = ({ className, children }: MarkdownComponentProps) => (
  <th
    className={cn(
      "border border-white/5 px-2 md:px-3 lg:px-4 py-2 md:py-3 text-left font-semibold text-zen-gold",
      className
    )}
  >
    {children}
  </th>
);

/**
 * Table data cell
 */
export const Td = ({ className, children }: MarkdownComponentProps) => (
  <td
    className={cn(
      "border border-white/5 px-2 md:px-3 lg:px-4 py-2 md:py-3 text-zen-mist/95",
      className
    )}
  >
    {children}
  </td>
);

