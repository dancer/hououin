import type { Metadata } from "next";

import { Topbar } from "@/components/topbar";
import { Vault } from "@/components/vault";

export const metadata: Metadata = {
  title: "Collection · hououin",
};

export default function Page() {
  return (
    <div className="px-edge py-edge grid min-h-dvh grid-rows-[auto_1fr] gap-[clamp(24px,4vh,44px)]">
      <header>
        <Topbar here="collection" />
      </header>
      <main>
        <Vault />
      </main>
    </div>
  );
}
