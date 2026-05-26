"use client";

import { useState, useCallback } from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

let toastListeners: Array<(toast: Toast) => void> = [];

export function emitToast(toast: Omit<Toast, "id">) {
  const t = { ...toast, id: Date.now().toString() };
  toastListeners.forEach((fn) => fn(t));
}

export function useToast() {
  const toast = useCallback((t: Omit<Toast, "id">) => {
    emitToast(t);
  }, []);

  return { toast };
}

export function useToastListener() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addListener = useCallback(() => {
    const handler = (t: Toast) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 4000);
    };
    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== handler);
    };
  }, []);

  return { toasts, addListener };
}
