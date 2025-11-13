import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatJournalDate = (date: string | number | Date) => {
  const parsed = dayjs(date);
  return parsed.format("MMM D, YYYY");
};
