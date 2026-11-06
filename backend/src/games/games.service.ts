import { DB_CLIENT } from '@app/infra/db/db.constants';
import { games, usersGames } from '@app/infra/db/schema';
import type { Db } from '@app/infra/db/schema.types';
import {
  BadRequestException,
  ConflictException,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { and, count, eq } from 'drizzle-orm';
import { UsersService } from 'src/users/users.service';
import { CreateGameDto } from './dto/create-game.dto';

export class GamesService {
  private readonly MIN_PLAYERS_TO_START_GAME = 4;

  constructor(
    @Inject(DB_CLIENT) private readonly db: Db,
    private readonly usersService: UsersService,
  ) {}

  async create(creatorId: string, createGameDto: CreateGameDto) {
    const [game] = await this.db
      .insert(games)
      .values({
        creatorId,
        ...createGameDto,
      })
      .returning();

    return game;
  }

  async findAll() {
    return this.db.query.games.findMany({
      with: {
        creator: {
          columns: {
            id: true,
            email: true,
            username: true,
          },
        },
        players: {
          columns: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findById(gameId: string) {
    const game = await this.db.query.games.findFirst({
      where: {
        id: gameId,
      },
      with: {
        creator: {
          columns: {
            id: true,
            email: true,
            username: true,
          },
        },
        players: true,
      },
    });

    if (!game) {
      throw new NotFoundException(`Game with id ${gameId} not found`);
    }

    return game;
  }

  async delete(userId: string, gameId: string) {
    const game = await this.findById(gameId);

    if (game.creatorId !== userId) {
      const user = await this.usersService.findById(userId);

      if (user.role !== 'ADMIN') {
        throw new UnauthorizedException(
          'You need to be an admin or creator of the game to delete a game',
        );
      }
    }

    await this.db.delete(games).where(eq(games.id, gameId));

    return {
      message: 'Game deleted successfully',
    };
  }

  async joinPlayerToGame(playerId: string, gameId: string) {
    const game = await this.findById(gameId);
    if (!game) {
      throw new NotFoundException(`Game with id ${gameId} not found`);
    }

    const result = await this.db.transaction(async (tx) => {
      const [insertedUsersGamesResult] = await tx
        .insert(usersGames)
        .values({ gameId, playerId })
        .onConflictDoNothing({
          target: [usersGames.gameId, usersGames.playerId],
        })
        .returning();

      if (!insertedUsersGamesResult) {
        throw new ConflictException('User is already in game');
      }

      const [results] = await tx
        .select({ totalPlayers: count() })
        .from(usersGames)
        .where(eq(usersGames.gameId, gameId));

      if (results.totalPlayers >= this.MIN_PLAYERS_TO_START_GAME) {
        await tx
          .update(games)
          .set({
            status: 'READY',
          })
          .where(eq(games.id, gameId));

        return {
          message:
            'User joined to game successfully and game is ready to start',
        };
      }

      return {
        message: 'User joined to game successfully',
      };
    });

    return result;
  }

  async removePlayerFromGame(
    creatorId: string,
    gameId: string,
    playerId: string,
  ) {
    const game = await this.findById(gameId);

    if (game.creatorId !== creatorId) {
      throw new UnauthorizedException(
        'You need to be the creator of this game to remove a player from it',
      );
    }

    const result = await this.db.transaction(async (tx) => {
      const [removedResult] = await tx
        .delete(usersGames)
        .where(
          and(eq(usersGames.gameId, gameId), eq(usersGames.playerId, playerId)),
        )
        .returning();

      if (!removedResult) {
        throw new BadRequestException(
          `Player with id ${playerId} is not in game with id ${gameId}`,
        );
      }

      const [results] = await tx
        .select({ totalPlayers: count() })
        .from(usersGames)
        .where(eq(usersGames.gameId, gameId));

      if (results.totalPlayers < this.MIN_PLAYERS_TO_START_GAME) {
        await tx.update(games).set({
          status: 'WAITING_FOR_PLAYERS',
        });

        return {
          message:
            'Player removed from game successfully and game is waiting for players',
        };
      }
    });

    return result;
  }
}
