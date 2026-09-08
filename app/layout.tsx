import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { AccountProvider } from "@/components/account";
import { Connect } from "@/components/connect";
import { Footer } from "@/components/footer";
import { load } from "@/lib/accounts";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["300", "400"],
});

export const metadata: Metadata = {
  applicationName: "hououin",
  description:
    "Sign in with Riot and read your daily store rotation and your owned skins from the browser. No overlay, no client, no waiting on the queue.",
  title: "hououin. see your valorant store before you launch the game",
};

export const viewport: Viewport = {
  themeColor: "#eeedeb",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { accounts, active } = await load();
  const seats = accounts.map((entry) => ({
    handle: entry.handle,
    id: entry.id,
  }));

  return (
    <html className={`${inter.variable} ${jetbrains.variable}`} lang="en">
      <body className="bg-paper text-ink font-sans antialiased">
        <AccountProvider active={active?.id ?? ""} seats={seats}>
          <div className="grid min-h-dvh grid-rows-[minmax(0,1fr)_auto]">
            {children}
            <Footer />
          </div>
          <Connect />
        </AccountProvider>
      </body>
    </html>
  );
}
