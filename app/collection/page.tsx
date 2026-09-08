import type { Metadata } from "next";
import Link from "next/link";

import { Account, AccountProvider } from "@/components/account";
import { Connect } from "@/components/connect";
import { Vault } from "@/components/vault";

export const metadata: Metadata = {
  title: "Collection · hououin",
};

export default function Page() {
  return (
    <AccountProvider>
      <div className="px-edge py-edge grid min-h-dvh grid-rows-[auto_1fr] gap-[clamp(24px,4vh,44px)]">
        <header className="border-rule flex items-center justify-between gap-6 border-b pb-[clamp(14px,2vh,22px)]">
          <Link className="text-[15px] font-medium tracking-[-0.01em]" href="/">
            hououin.
          </Link>
          <div className="flex items-center gap-[clamp(16px,2.4vw,30px)]">
            <Link
              className="cap text-ink-3 hover:text-ink transition-colors duration-200"
              href="/"
            >
              Store
            </Link>
            <Account />
          </div>
        </header>

        <main>
          <Vault />
        </main>
      </div>
      <Connect />
    </AccountProvider>
  );
}
