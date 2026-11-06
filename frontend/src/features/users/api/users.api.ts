import { api } from "../../../lib/config/api.config";
import type { GameWithCreatorAndPlayers } from "../../games/types/games.types";
import type { PublicUser, UpdateUserDto } from "../types/users.types";

const RESOURCE_PATH = "users";

export const usersApi = {
  update: async (data: UpdateUserDto): Promise<PublicUser> => {
    const response = await api.patch<PublicUser>(`${RESOURCE_PATH}/me`, data);
    return response.data;
  },

  delete: async (): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`${RESOURCE_PATH}/me`);
    return response.data;
  },

  getMyGames: async (): Promise<GameWithCreatorAndPlayers[]> => {
    const response = await api.get<GameWithCreatorAndPlayers[]>(`${RESOURCE_PATH}/me/games`);
    return response.data;
  },

  getMyCreatedGames: async (): Promise<Omit<GameWithCreatorAndPlayers, "creator">[]> => {
    const response = await api.get<Omit<GameWithCreatorAndPlayers, "creator">[]>(
      `${RESOURCE_PATH}/me/created-games`,
    );
    return response.data;
  },
};
