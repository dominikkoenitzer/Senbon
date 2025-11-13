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
    <form
      onSubmit={handleSubmit}
      className="zen-card flex flex-col gap-4 bg-black/30 p-6"
    >
      <div>
        <label
          htmlFor="name"
          className="text-xs uppercase tracking-[0.35em] text-zen-gold/70"
        >
          Name
        </label>
        <Input
          id="name"
          placeholder="Your name"
          {...form.register("name")}
          disabled={status === "pending"}
          className="mt-2 bg-black/20"
        />
        {form.formState.errors.name ? (
          <p className="mt-1 text-xs text-red-300">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="message"
          className="text-xs uppercase tracking-[0.35em] text-zen-gold/70"
        >
          Message
        </label>
        <Textarea
          id="message"
          rows={4}
          placeholder="Leave your message..."
          {...form.register("message")}
          disabled={status === "pending"}
          className="mt-2 bg-black/20"
        />
        {form.formState.errors.message ? (
          <p className="mt-1 text-xs text-red-300">
            {form.formState.errors.message.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={status === "pending"}
        className="mt-2 rounded-full border border-zen-gold/40 bg-transparent text-zen-gold hover:bg-zen-gold/10"
      >
        {status === "pending" ? "Sending..." : "Submit"}
      </Button>

      {status === "success" ? (
        <p className="text-sm text-zen-gold">
          Entry sent! It will appear after admin approval.
        </p>
      ) : null}
      {status === "error" && errorMessage ? (
        <p className="text-sm text-red-300">{errorMessage}</p>
      ) : null}
    </form>
  );
};

export default GuestbookForm;

