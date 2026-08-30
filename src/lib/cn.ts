import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Class-name merge. Its own module, deliberately free of side effects, so a
 * client component can pull it in without dragging the dayjs date helpers (and
 * the `dayjs.extend` side effect that defeats their tree-shaking) from
 * `lib/utils` into that route's bundle.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
