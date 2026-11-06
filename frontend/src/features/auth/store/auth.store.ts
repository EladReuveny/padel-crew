import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PublicUser } from "../../users/types/users.types";

export type AuthStore = {
  user?: PublicUser;
  login: (user: PublicUser) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: undefined,
      login: (user: PublicUser): void => {
        set({ user });
      },
      logout: (): void => {
        set({ user: undefined });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
