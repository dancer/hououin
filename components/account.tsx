"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import type { Offer } from "@/lib/offers";

interface Feed {
  handle: string;
  offers: Offer[];
  seconds: number;
}

type State =
  | { status: "loading" }
  | { status: "off" }
  | ({ status: "on" } & Feed);

interface Value {
  state: State;
  open: boolean;
  setOpen: (next: boolean) => void;
  connect: (cookie: string) => Promise<string | null>;
  disconnect: () => Promise<void>;
}

const Context = createContext<Value | null>(null);

export const useAccount = () => {
  const value = useContext(Context);
  if (!value) {
    throw new Error("useAccount used outside AccountProvider");
  }
  return value;
};

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<State>({ status: "loading" });
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/store");
    if (!res.ok) {
      setState({ status: "off" });
      return;
    }
    const feed: Feed = await res.json();
    setState({ status: "on", ...feed });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const connect = useCallback(
    async (cookie: string) => {
      const res = await fetch("/api/connect", {
        body: JSON.stringify({ cookie }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return typeof body.error === "string" ? body.error : "connect failed";
      }
      setOpen(false);
      setState({ status: "loading" });
      await load();
      return null;
    },
    [load]
  );

  const disconnect = useCallback(async () => {
    await fetch("/api/connect", { method: "DELETE" });
    setState({ status: "off" });
  }, []);

  const value = useMemo(
    () => ({ connect, disconnect, open, setOpen, state }),
    [connect, disconnect, open, state]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const Account = () => {
  const { state, setOpen, disconnect } = useAccount();

  if (state.status === "on") {
    return (
      <button
        className="cap border-rule-2 hover:bg-ink hover:text-paper cursor-pointer border px-[18px] py-[10px] transition-colors duration-300 hover:border-transparent"
        onClick={disconnect}
        type="button"
      >
        {state.handle || "Connected"}
      </button>
    );
  }

  return (
    <button
      className="cap border-rule-2 hover:bg-ink hover:text-paper cursor-pointer border px-[18px] py-[10px] transition-colors duration-300 hover:border-transparent"
      onClick={() => setOpen(true)}
      type="button"
    >
      Connect your account
    </button>
  );
};
