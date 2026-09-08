"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

export interface Seat {
  handle: string;
  id: string;
}

interface Value {
  state: State;
  seats: Seat[];
  active: string;
  open: boolean;
  setOpen: (next: boolean) => void;
  connect: (cookie: string) => Promise<string | null>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
  switchTo: (id: string) => Promise<void>;
}

const Context = createContext<Value | null>(null);

export const useAccount = () => {
  const value = useContext(Context);
  if (!value) {
    throw new Error("useAccount used outside AccountProvider");
  }
  return value;
};

export const AccountProvider = ({
  active: seeded,
  children,
  seats: initial,
}: {
  active: string;
  children: ReactNode;
  seats: Seat[];
}) => {
  const [state, setState] = useState<State>({ status: "loading" });
  const [seats, setSeats] = useState<Seat[]>(initial);
  const [active, setActive] = useState(seeded);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const [feedRes, seatRes] = await Promise.all([
      fetch("/api/store"),
      fetch("/api/accounts"),
    ]);
    if (seatRes.ok) {
      const body = await seatRes.json();
      setSeats(body.accounts);
      setActive(body.active ?? "");
    }
    if (!feedRes.ok) {
      setState({ status: "off" });
      return;
    }
    const feed: Feed = await feedRes.json();
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
    const id = active || seats[0]?.id;
    if (!id) {
      return;
    }
    await fetch(`/api/accounts?id=${id}`, { method: "DELETE" });
    setSeats((current) => current.filter((seat) => seat.id !== id));
    setActive("");
    setState({ status: "loading" });
    await load();
  }, [active, load, seats]);

  const switchTo = useCallback(
    async (id: string) => {
      setActive(id);
      await fetch("/api/accounts", {
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      setState({ status: "loading" });
      await load();
    },
    [load]
  );

  const value = useMemo(
    () => ({
      active,
      connect,
      disconnect,
      open,
      refresh: load,
      seats,
      setOpen,
      state,
      switchTo,
    }),
    [active, connect, disconnect, load, open, seats, state, switchTo]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const Account = () => {
  const { active, seats, setOpen, disconnect, switchTo } = useAccount();
  const [menu, setMenu] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) {
      return;
    }
    const away = (event: MouseEvent) => {
      if (!box.current?.contains(event.target as Node)) {
        setMenu(false);
      }
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(false);
      }
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
    };
  }, [menu]);

  const seat = seats.find((entry) => entry.id === active) ?? seats[0];

  if (!seat) {
    return (
      <button
        className="cap border-rule-2 hover:bg-ink hover:text-paper cursor-pointer border px-[18px] py-[10px] transition-colors duration-300 hover:border-transparent"
        onClick={() => setOpen(true)}
        type="button"
      >
        Connect your account
      </button>
    );
  }

  return (
    <div className="relative" ref={box}>
      <button
        aria-expanded={menu}
        aria-haspopup="menu"
        className="cap border-rule-2 hover:bg-ink hover:text-paper max-w-[210px] cursor-pointer truncate border px-[18px] py-[10px] transition-colors duration-300 hover:border-transparent"
        onClick={() => setMenu(!menu)}
        type="button"
      >
        {seat.handle}
      </button>

      {menu ? (
        <div
          className="border-rule-2 bg-paper absolute top-[calc(100%+8px)] right-0 z-20 grid w-[248px] border shadow-[0_24px_50px_-24px_rgba(0,0,0,0.35)]"
          role="menu"
        >
          {seats.map((entry) => (
            <button
              className={`cap flex cursor-pointer items-center justify-between gap-3 px-[14px] py-[11px] text-left transition-colors duration-200 ${
                entry.id === seat.id ? "text-ink" : "text-ink-3 hover:text-ink"
              }`}
              key={entry.id}
              onClick={() => {
                setMenu(false);
                switchTo(entry.id);
              }}
              type="button"
            >
              <span className="truncate">{entry.handle}</span>
              {entry.id === seat.id ? (
                <span className="bg-accent size-[5px] shrink-0" />
              ) : null}
            </button>
          ))}

          <button
            className="cap border-rule text-ink-3 hover:text-ink cursor-pointer border-t px-[14px] py-[11px] text-left transition-colors duration-200"
            onClick={() => {
              setMenu(false);
              setOpen(true);
            }}
            type="button"
          >
            Add account
          </button>
          <button
            className="cap border-rule text-ink-3 hover:text-accent cursor-pointer border-t px-[14px] py-[11px] text-left transition-colors duration-200"
            onClick={() => {
              setMenu(false);
              disconnect();
            }}
            type="button"
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
};
