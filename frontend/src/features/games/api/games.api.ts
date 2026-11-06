import { api } from "../../../lib/config/api.config";
import type { CreateGameDto, Game, GameWithCreatorAndPlayers } from "../types/games.types";

const RESOURCE_PATH = "games";

export const gamesApi = {
  findAll: async (): Promise<GameWithCreatorAndPlayers[]> => {
    const response = await api.get<GameWithCreatorAndPlayers[]>(`${RESOURCE_PATH}`);
    return response.data;
  },

  create: async (data: CreateGameDto): Promise<Game> => {
    const response = await api.post<Game>(`${RESOURCE_PATH}`, data);
    return response.data;
  },

  findById: async (gameId: string): Promise<GameWithCreatorAndPlayers> => {
    const response = await api.get<GameWithCreatorAndPlayers>(`${RESOURCE_PATH}/${gameId}`);
    return response.data;
  },

  delete: async (gameId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`${RESOURCE_PATH}/${gameId}`);
    return response.data;
  },

  joinPlayerToGame: async (gameId: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`${RESOURCE_PATH}/${gameId}/join`);
    return response.data;
  },

  removePlayerFromGame: async (gameId: string, playerId: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      `${RESOURCE_PATH}/${gameId}/remove/${playerId}`,
    );
    return response.data;
  },
};
