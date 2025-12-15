import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: "light",

  setTheme: (theme: string) => {
    set({ theme });
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  },

  initializeTheme: () => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      set({ theme: "dark" });
    }
  },
}));
