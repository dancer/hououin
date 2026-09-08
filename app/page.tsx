import Link from "next/link";

import { Store } from "@/components/store";
import { offers, total } from "@/lib/offers";

const REPO = "https://github.com/dancer/hououin";
const HEADLINE = "See your store before you launch the game";

interface Fact {
  term: string;
  lines: string[];
}

const facts: Fact[] = [
  { lines: ["Valorant store watcher", "Read only"], term: "What" },
  { lines: ["Daily rotation", "Your collection"], term: "Shows" },
  {
    lines: [`${offers.length} offers`, `${total.toLocaleString("en-US")} VP`],
    term: "Today",
  },
  { lines: ["Source"], term: "Elsewhere" },
];

const line = "m-0 text-ink-2 text-[13px] leading-[1.75] font-light";

export default function Home() {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_minmax(0,1fr)_auto]">
      <header className="px-edge pt-edge">
        <div className="border-rule flex items-center justify-between gap-6 border-b pb-[clamp(14px,2vh,22px)]">
          <Link className="text-[15px] font-medium tracking-[-0.01em]" href="/">
            hououin.
          </Link>
          <button
            className="cap border-rule-2 hover:bg-ink hover:text-paper cursor-pointer border px-[18px] py-[10px] transition-colors duration-300 hover:border-transparent"
            type="button"
          >
            Sign in with Riot
          </button>
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
            className={`${line} rise max-w-[34ch]`}
            style={{ animationDelay: "540ms" }}
          >
            {
              "Sign in with Riot and read today's four offers, what they cost, and the skins already sitting in your collection. Nothing to install."
            }
          </p>
        </div>

        <Store />
      </main>

      <footer className="px-edge pb-edge">
        <dl className="border-rule m-0 grid grid-cols-2 gap-x-[clamp(20px,5vw,64px)] gap-y-6 border-t pt-[clamp(16px,2.4vh,26px)] sm:flex sm:flex-wrap sm:items-end sm:gap-x-[clamp(24px,5vw,64px)]">
          {facts.map((fact, index) => (
            <div
              className={index === facts.length - 1 ? "sm:ml-auto" : undefined}
              key={fact.term}
            >
              <dt className="cap text-ink-3 mb-[11px]">{fact.term}</dt>
              {fact.lines.map((text) => (
                <dd className={line} key={text}>
                  {text === "Source" ? (
                    <a
                      className="hover:text-ink transition-colors duration-200"
                      href={REPO}
                      rel="noopener"
                    >
                      {text}
                    </a>
                  ) : (
                    text
                  )}
                </dd>
              ))}
            </div>
          ))}
        </dl>
      </footer>
    </div>
  );
}
