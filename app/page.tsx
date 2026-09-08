import Link from "next/link";

import { Account, AccountProvider } from "@/components/account";
import { Connect } from "@/components/connect";
import { Store } from "@/components/store";

const HEADLINE = "See your store before you launch the game";

export default function Home() {
  return (
    <AccountProvider>
      <div className="grid min-h-dvh grid-rows-[auto_minmax(0,1fr)]">
        <header className="px-edge pt-edge">
          <div className="border-rule flex items-center justify-between gap-6 border-b pb-[clamp(14px,2vh,22px)]">
            <Link
              className="text-[15px] font-medium tracking-[-0.01em]"
              href="/"
            >
              hououin.
            </Link>
            <div className="flex items-center gap-[clamp(16px,2.4vw,30px)]">
              <Link
                className="cap text-ink-3 hover:text-ink transition-colors duration-200"
                href="/collection"
              >
                Collection
              </Link>
              <Account />
            </div>
          </div>
        </header>

        <main className="px-edge grid min-h-0 content-center gap-[clamp(20px,3vh,34px)] py-[clamp(14px,3vh,36px)]">
          <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
            <h1 className="m-0 max-w-[20ch] text-[clamp(26px,3.4vw,42px)] leading-[1.06] font-light tracking-[-0.026em]">
              <span className="cap text-ink-3 rise mb-[clamp(8px,1.2vh,14px)] block">
                Daily rotation
              </span>
              {HEADLINE.split(" ").map((word, index) => (
                <span
                  className="rise mr-[0.26em] inline-block"
                  key={`${word}-${index}`}
                  style={{ animationDelay: `${60 + index * 55}ms` }}
                >
                  {word}
                </span>
              ))}
            </h1>

            <p
              className="text-ink-2 rise m-0 max-w-[34ch] text-[13px] leading-[1.75] font-light"
              style={{ animationDelay: "540ms" }}
            >
              {
                "Scan once with Riot Mobile and read today's four offers, what they cost, and everything already in your collection."
              }
            </p>
          </div>

          <Store />
        </main>
      </div>
      <Connect />
    </AccountProvider>
  );
}
