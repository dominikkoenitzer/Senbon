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
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-[0.4em] text-zen-gold/50">
        Write a message
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Input
            id="name"
            placeholder="Your name"
            {...form.register("name")}
            disabled={status === "pending"}
            className="bg-transparent border-white/10 focus:border-zen-gold/30 rounded-none border-x-0 border-t-0 border-b"
          />
          {form.formState.errors.name && (
            <p className="text-xs text-zen-mist/50">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Textarea
            id="message"
            rows={5}
            placeholder="Leave your message..."
            {...form.register("message")}
            disabled={status === "pending"}
            className="bg-transparent border-white/10 focus:border-zen-gold/30 rounded-none resize-none"
          />
          {form.formState.errors.message && (
            <p className="text-xs text-zen-mist/50">
              {form.formState.errors.message.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={status === "pending"}
          className="w-full rounded-none border border-zen-gold/20 bg-transparent text-zen-gold hover:bg-zen-gold/5 hover:border-zen-gold/30 transition-all"
        >
          {status === "pending" ? "Sending..." : "Submit"}
        </Button>

        {status === "success" && (
          <p className="text-xs text-zen-gold/70">
            Message sent. It will appear after approval.
          </p>
        )}
        
        {status === "error" && errorMessage && (
          <p className="text-xs text-zen-mist/60">{errorMessage}</p>
        )}
      </form>
    </div>
  );
};

export default GuestbookForm;
