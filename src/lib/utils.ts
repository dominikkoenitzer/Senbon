import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const formatJournalDate = (date: string | number | Date): string =>
  dayjs(date).format("MMM D, YYYY");

/**
 * "3 weeks ago" / "in 2 days" style, with sensible thresholds:
 *  - today / yesterday for very recent
 *  - dayjs relative for the middle range
 *  - absolute date for anything older than a year
 *
 * Always lowercase: every place this renders is site chrome, and the chrome is
 * lowercase throughout. Lowercasing here rather than at each call site is what
 * stopped the guestbook wall from showing a capital "Today" next to journal
 * cards that did not.
 */
export const formatRelativeDate = (
  date: string | number | Date,
  now: Date = new Date()
): string => {
  const target = dayjs(date);
  const today = dayjs(now);
  const diffDays = today.startOf("day").diff(target.startOf("day"), "day");
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  // Within a year either side (past or future), use the relative phrasing;
  // anything older or further out reads better as an absolute date.
  if (Math.abs(diffDays) < 365) return target.from(today).toLowerCase();
  return target.format("MMM D, YYYY").toLowerCase();
};
