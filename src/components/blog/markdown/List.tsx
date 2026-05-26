"use client";

import { cn } from "@/lib/utils";
import type { MarkdownComponentProps } from "./types";

export const Ul = ({ className, children }: MarkdownComponentProps) => (
  <ul
    className={cn(
      "my-6 ml-5 flex list-disc flex-col gap-2 text-[1.0625rem] text-foreground/85 marker:text-primary/70",
      className
    )}
  >
    {children}
  </ul>
);

export const Ol = ({ className, children }: MarkdownComponentProps) => (
  <ol
    className={cn(
      "my-6 ml-5 flex list-decimal flex-col gap-2 text-[1.0625rem] text-foreground/85 marker:text-primary/70",
      className
    )}
  >
    {children}
  </ol>
);

export const Li = ({ className, children }: MarkdownComponentProps) => (
  <li className={cn("pl-1 leading-[1.75]", className)}>{children}</li>
);
