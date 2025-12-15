"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";

export default function ThemeInitializer() {
  const initializeTheme = useThemeStore((s: any) => s.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, []);

  return null;
}
