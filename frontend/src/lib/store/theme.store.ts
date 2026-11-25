import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";

type ThemeStore = {
  theme: Theme;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "dark",
      toggleTheme: (): void => {
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" }));
      },
    }),
    {
      name: "theme-storage",
    },
  ),
);
