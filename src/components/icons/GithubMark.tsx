import type { SVGProps } from "react";

/**
 * The GitHub mark, drawn here because lucide-react dropped its brand icons in
 * v1. Sized and coloured like a lucide glyph (1em square, `currentColor`) so it
 * sits beside the rest of them without special-casing.
 */
export const GithubMark = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M12 .5a11.5 11.5 0 0 0-3.634 22.414c.575.106.785-.25.785-.554 0-.273-.01-.997-.015-1.957-3.198.695-3.873-1.542-3.873-1.542-.523-1.33-1.277-1.684-1.277-1.684-1.044-.714.079-.699.079-.699 1.154.081 1.761 1.185 1.761 1.185 1.026 1.758 2.692 1.25 3.348.956.104-.744.401-1.25.73-1.538-2.553-.291-5.238-1.277-5.238-5.686 0-1.256.449-2.283 1.184-3.088-.119-.291-.513-1.462.113-3.047 0 0 .966-.31 3.164 1.18a10.98 10.98 0 0 1 5.762 0c2.196-1.49 3.16-1.18 3.16-1.18.628 1.585.234 2.756.115 3.047.738.805 1.183 1.832 1.183 3.088 0 4.42-2.689 5.392-5.25 5.677.413.355.78 1.056.78 2.128 0 1.537-.014 2.776-.014 3.154 0 .307.207.665.79.552A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);
