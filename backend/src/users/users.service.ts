import { DB_CLIENT } from '@app/infra/db/db.constants';
import { users } from '@app/infra/db/schema';
import type { Db, User } from '@app/infra/db/schema.types';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(DB_CLIENT) private readonly db: Db) {}

  async create(registerUserDto: RegisterUserDto) {
    const [user] = await this.db
      .insert(users)
      .values({
        email: registerUserDto.email,
        username: registerUserDto.email.split('@')[0],
        hashPassword: registerUserDto.password,
      })
      .returning();

    return user;
  }

  async findById(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.db.query.users.findFirst({
      where: {
        email,
      },
    });

    return user;
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    const { password, confirmPassword } = updateUserDto;
    const isValidPassword =
      password && confirmPassword && password === confirmPassword;
    if (!isValidPassword) {
      throw new BadRequestException('Passwords must be match');
    }

    const [user] = await this.db
      .update(users)
      .set({
        hashPassword: await this.hashPassword(password),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return this.toPublicUser(user);
  }

  async delete(userId: string) {
    const [user] = await this.db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return { message: 'User deleted successfully' };
  }

  private async hashPassword(password: string) {
    const SALT_ROUNDS = 10;
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  toPublicUser(user: User) {
    const { hashPassword, ...userWithoutPassword } = user;
    void hashPassword;

    return userWithoutPassword;
  }

  async getMyGames(userId: string) {
    const res = await this.db.query.games.findMany({
      where: {
        players: {
          id: userId,
        },
      },
      with: {
        creator: {
          columns: {
            id: true,
            username: true,
          },
        },
        players: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
    });

    return res;
  }

  async getMyCreatedGames(userId: string) {
    const res = await this.db.query.games.findMany({
      where: {
        creatorId: userId,
      },
      with: {
        players: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
    });

    return res;
  }
}
