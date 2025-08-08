"use client";

import { ToastContextProvider } from "@/components/ui/toast-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ToastContextProvider>{children}</ToastContextProvider>;
}
