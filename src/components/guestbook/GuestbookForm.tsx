"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { GuestbookEntry } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2, "Names need at least two characters."),
  message: z
    .string()
    .min(6, "Please write a bit more.")
    .max(480, "Message must be 480 characters or less."),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  onSubmitted?: (entry: GuestbookEntry) => void;
};

const GuestbookForm = ({ onSubmitted }: Props) => {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", message: "" },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setStatus("pending");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || "Unable to leave a message right now.";
        throw new Error(
          errorMsg === "rate_limited"
            ? "Please wait a moment before submitting again."
            : errorMsg === "invalid_message"
            ? "Message is too short or too long."
            : errorMsg === "database_error"
            ? "Database connection error. Please try again."
            : "Unable to leave a message right now."
        );
      }

      const data = await response.json();
      form.reset();
      setStatus("success");
      if (data.item) {
        onSubmitted?.(data.item);
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit. Please try again later.",
      );
    } finally {
      setTimeout(() => setStatus("idle"), 6000);
    }
  });

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Input
            id="name"
            placeholder="Your name"
            {...form.register("name")}
            disabled={status === "pending"}
            className="bg-transparent border-0 border-b border-white/10 focus:border-zen-gold/30 rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
          />
          {form.formState.errors.name && (
            <p className="text-xs text-zen-mist/40">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Textarea
            id="message"
            rows={6}
            placeholder="Leave your message..."
            {...form.register("message")}
            disabled={status === "pending"}
            className="bg-transparent border-0 border-b border-white/10 focus:border-zen-gold/30 rounded-none px-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
            style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
          />
          {form.formState.errors.message && (
            <p className="text-xs text-zen-mist/40">
              {form.formState.errors.message.message}
            </p>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={status === "pending"}
            className="w-full rounded-none border border-zen-gold/15 bg-transparent text-zen-gold/80 hover:bg-zen-gold/5 hover:border-zen-gold/25 transition-all"
          >
            {status === "pending" ? "Sending..." : "Submit"}
          </Button>
        </div>

        {status === "success" && (
          <p className="text-xs text-zen-gold/60">
            Message sent. It will appear below.
          </p>
        )}

        {status === "error" && errorMessage && (
          <p className="text-xs text-zen-mist/50">{errorMessage}</p>
        )}
      </form>
    </div>
  );
};

export default GuestbookForm;
