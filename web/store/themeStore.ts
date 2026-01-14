import { create } from "zustand";
import { persist } from "zustand/middleware";
type Theme = "light" | "dark";
import { ViewState } from "@/types";
interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme:
    (typeof window !== "undefined" &&
      (localStorage.getItem("theme") as Theme)) ||
    "light",
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      return { theme: newTheme };
    }),
  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    set({ theme });
  },
}));

interface ViewStateStore {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const useViewStore = create<ViewStateStore>()(
  persist(
    (set) => ({
      currentView: "PUBLIC_HOME",
      setView: (view) => {
        set({ currentView: view });
      },
    }),
    {
      name: "alm-current-view",
    }
  )
);
