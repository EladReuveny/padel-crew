import { Game, User } from '@app/infra/db/schema.types';
import { CurrentUser } from '@app/utils/decorators/current-user.decorator';
import { JwtGuard } from '@app/utils/guards/jwt.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUser } from './types/user.types';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  @UseGuards(JwtGuard)
  update(
    @CurrentUser('sub') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<PublicUser> {
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete('me')
  @UseGuards(JwtGuard)
  delete(@CurrentUser('sub') userId: string): Promise<{ message: string }> {
    return this.usersService.delete(userId);
  }

  @Get('me/games')
  @UseGuards(JwtGuard)
  getMyGames(@CurrentUser('sub') userId: string): Promise<
    (Game & {
      players: Pick<User, 'id' | 'username'>[];
      creator: Pick<User, 'id' | 'username'> | null;
    })[]
  > {
    return this.usersService.getMyGames(userId);
  }

  @Get('me/created-games')
  @UseGuards(JwtGuard)
  getMyCreatedGames(@CurrentUser('sub') userId: string): Promise<
    (Game & {
      players: Pick<User, 'id' | 'username'>[];
    })[]
  > {
    return this.usersService.getMyCreatedGames(userId);
  }
}
