"use client";

import { useEffect, useState } from "react";

/**
 * Returns whether the app is currently in dark mode, and updates live when the
 * `.dark` class on <html> changes (e.g. from the ThemeToggle).
 */
export function useDarkMode(): boolean {
  const [isDark, setIsDark] = useState<boolean>(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();

    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}