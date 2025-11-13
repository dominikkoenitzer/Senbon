"use client";

import { useEffect, useState } from "react";
import { getTimeWindowSecret } from "@/lib/utils";

const TimeOfDaySecret = () => {
  const [message, setMessage] = useState(getTimeWindowSecret());

  useEffect(() => {
    const interval = setInterval(
      () => setMessage(getTimeWindowSecret()),
      60_000,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-zen-mist/80">
      <p className="text-xs uppercase tracking-[0.35em] text-zen-gold/70">
        time message
      </p>
      <p className="mt-2 text-sm text-zen-mist/90">{message}</p>
    </div>
  );
};

export default TimeOfDaySecret;

