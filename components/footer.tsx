const REPO = "https://github.com/dancer/hououin";

export const Footer = () => (
  <footer className="px-edge pb-edge pt-[clamp(16px,2.4vh,26px)]">
    <div className="border-rule flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t pt-[clamp(12px,1.6vh,16px)]">
      <span className="cap text-ink-3">hououin.com</span>
      <span className="cap text-ink-3/60">Not affiliated with riot games</span>
      <a
        className="cap text-ink-3 hover:text-ink transition-colors duration-200"
        href={REPO}
        rel="noopener"
      >
        Source
      </a>
    </div>
  </footer>
);
