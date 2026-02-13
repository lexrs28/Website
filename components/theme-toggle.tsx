"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const storageKey = "site-theme";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(storageKey, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    const nextTheme = saved === "light" || saved === "dark" ? saved : getSystemTheme();

    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
    setMounted(true);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (!window.localStorage.getItem(storageKey)) {
        const systemTheme = getSystemTheme();
        document.documentElement.dataset.theme = systemTheme;
        setTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  const nextTheme: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={mounted ? `Switch to ${nextTheme} mode` : "Toggle theme"}
      onClick={() => {
        const updatedTheme = theme === "dark" ? "light" : "dark";
        applyTheme(updatedTheme);
        setTheme(updatedTheme);
      }}
    >
      {mounted ? `Theme: ${theme}` : "Theme"}
    </button>
  );
}
