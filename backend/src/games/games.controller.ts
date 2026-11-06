import { Game, User } from '@app/infra/db/schema.types';
import { CurrentUser } from '@app/utils/decorators/current-user.decorator';
import { JwtGuard } from '@app/utils/guards/jwt.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  findAll(): Promise<
    (Game & {
      creator: Pick<User, 'id' | 'email' | 'username'> | null;
      players: Pick<User, 'id' | 'email' | 'username'>[];
    })[]
  > {
    return this.gamesService.findAll();
  }

  @Post()
  @UseGuards(JwtGuard)
  create(
    @CurrentUser('sub') creatorId: string,
    @Body() createGameDto: CreateGameDto,
  ) {
    return this.gamesService.create(creatorId, createGameDto);
  }

  @Get(':gameId')
  findById(@Param('gameId') gameId: string) {
    return this.gamesService.findById(gameId);
  }

  @Delete(':gameId')
  @UseGuards(JwtGuard)
  delete(
    @CurrentUser('sub') userId: string,
    @Param('gameId') gameId: string,
  ): Promise<{ message: string }> {
    return this.gamesService.delete(userId, gameId);
  }

  @Post(':gameId/join')
  @UseGuards(JwtGuard)
  joinPlayerToGame(
    @CurrentUser('sub') playerId: string,
    @Param('gameId') gameId: string,
  ): Promise<{ message: string }> {
    return this.gamesService.joinPlayerToGame(playerId, gameId);
  }

  @Post(':gameId/remove/:playerId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  removePlayerFromGame(
    @CurrentUser('sub') creatorId: string,
    @Param('gameId') gameId: string,
    @Param('playerId') playerId: string,
  ) {
    return this.gamesService.removePlayerFromGame(creatorId, gameId, playerId);
  }
}
