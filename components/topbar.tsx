import Link from "next/link";

import { Account } from "@/components/account";
import { Mark } from "@/components/mark";

export const Topbar = ({ here }: { here: "store" | "collection" }) => (
  <div className="border-rule flex items-center justify-between gap-6 border-b pb-[clamp(14px,2vh,22px)]">
    <Link
      aria-label="hououin home"
      className="text-[16px] font-medium tracking-[-0.01em]"
      href="/"
    >
      <Mark />
    </Link>
    <div className="flex items-center gap-[clamp(16px,2.4vw,30px)]">
      <Link
        className="cap text-ink-3 hover:text-ink transition-colors duration-200"
        href={here === "store" ? "/collection" : "/"}
      >
        {here === "store" ? "Collection" : "Store"}
      </Link>
      <Account />
    </div>
  </div>
);
