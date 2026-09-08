"use client";

import { useAccount } from "@/components/account";

export const Pitch = () => {
  const { seats } = useAccount();

  if (seats.length > 0) {
    return null;
  }

  return (
    <p
      className="text-ink-2 rise m-0 max-w-[34ch] text-[13px] leading-[1.75] font-light"
      style={{ animationDelay: "540ms" }}
    >
      Scan once with Riot Mobile and read today&apos;s four offers, what they
      cost, and everything already in your collection.
    </p>
  );
};
