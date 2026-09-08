import { Pitch } from "@/components/pitch";
import { Store } from "@/components/store";
import { Topbar } from "@/components/topbar";

const HEADLINE = "See your store before you launch the game";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_minmax(0,1fr)]">
      <header className="px-edge pt-edge">
        <Topbar here="store" />
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

          <Pitch />
        </div>

        <Store />
      </main>
    </div>
  );
}
