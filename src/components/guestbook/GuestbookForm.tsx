"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
        throw new Error("Unable to leave a message right now.");
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
    <div className="zen-card p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-zen-gold/60 mb-4">
            Write a message
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-xs uppercase tracking-[0.3em] text-zen-mist/70"
          >
            Name
          </label>
          <Input
            id="name"
            placeholder="Your name"
            {...form.register("name")}
            disabled={status === "pending"}
            className="bg-black/20 border-white/10"
          />
          {form.formState.errors.name && (
            <p className="text-xs text-red-300/80">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="message"
            className="text-xs uppercase tracking-[0.3em] text-zen-mist/70"
          >
            Message
          </label>
          <Textarea
            id="message"
            rows={6}
            placeholder="Leave your message..."
            {...form.register("message")}
            disabled={status === "pending"}
            className="bg-black/20 border-white/10 resize-none"
          />
          {form.formState.errors.message && (
            <p className="text-xs text-red-300/80">
              {form.formState.errors.message.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={status === "pending"}
          className="w-full rounded-lg border border-zen-gold/30 bg-zen-gold/5 text-zen-gold hover:bg-zen-gold/10 hover:border-zen-gold/40 transition-all"
        >
          {status === "pending" ? "Sending..." : "Submit message"}
        </Button>

        {status === "success" && (
          <div className="rounded-lg border border-zen-gold/30 bg-zen-gold/5 px-4 py-3">
            <p className="text-sm text-zen-gold">
              Message sent! It will appear after approval.
            </p>
          </div>
        )}
        
        {status === "error" && errorMessage && (
          <div className="rounded-lg border border-red-300/30 bg-red-300/5 px-4 py-3">
            <p className="text-sm text-red-300">{errorMessage}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default GuestbookForm;
