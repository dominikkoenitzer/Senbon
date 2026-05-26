import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { twMerge } from "tailwind-merge";

dayjs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatJournalDate = (date: string | number | Date): string =>
  dayjs(date).format("MMM D, YYYY");

/**
 * "3 weeks ago" / "in 2 days" style, with sensible thresholds:
 *  - today / yesterday for very recent
 *  - dayjs relative for the middle range
 *  - absolute date for anything older than a year
 */
export const formatRelativeDate = (
  date: string | number | Date,
  now: Date = new Date()
): string => {
  const target = dayjs(date);
  const today = dayjs(now);
  const diffDays = today.startOf("day").diff(target.startOf("day"), "day");
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 0 && diffDays < 365) return target.from(today);
  if (diffDays < 0 && diffDays > -365) return target.from(today);
  return target.format("MMM D, YYYY");
};
