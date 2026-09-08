"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

export const Trap = ({
  children,
  className,
  onClose,
}: {
  children: ReactNode;
  className?: string;
  onClose: () => void;
}) => {
  const box = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    box.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close.current();
        return;
      }
      if (event.key !== "Tab" || !box.current) {
        return;
      }
      const nodes = [...box.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (nodes.length === 0) {
        return;
      }
      const edge = event.shiftKey ? nodes[0] : nodes.at(-1);
      if (document.activeElement === edge) {
        event.preventDefault();
        (event.shiftKey ? nodes.at(-1) : nodes[0])?.focus();
      }
    };

    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);

  return (
    <div className={className} ref={box}>
      {children}
    </div>
  );
};
