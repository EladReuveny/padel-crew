import { User } from "../../users/types/users.types";

export type Game = {
  id: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  location: string;
  status: GameStatus;
  creatorId: string;
};

export type GameStatus = "WAITING_FOR_PLAYERS" | "READY" | "IN_PROGRESS" | "FINISHED";

export type CreateGameDto = {
  title?: string;
  location: string;
  date?: Date;
};

export type GameWithCreatorAndPlayers = Game & {
  creator: Pick<User, "id" | "email" | "username"> | null;
  players: Pick<User, "id" | "email" | "username">[];
};

export type GameWithPlayers = GameWithCreatorAndPlayers;
