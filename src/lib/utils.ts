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

export const getTimeWindowSecret = () => {
  const hour = dayjs().hour();
  if (hour >= 5 && hour < 6) {
    return "Early morning — a quiet time for reflection.";
  }
  if (hour >= 20 && hour < 22) {
    return "Evening hours — a peaceful time to browse entries.";
  }
  return "The garden is quiet. All messages are safely stored.";
};
