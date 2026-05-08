"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--color-terminal)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-primary)",
        },
      }}
    />
  );
}