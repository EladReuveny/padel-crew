import { DB_CLIENT } from '@app/infra/db/db.constants';
import type { Db, User } from '@app/infra/db/schema.types';
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'node_modules/bcryptjs';
import { PublicUser } from 'src/users/types/user.types';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtPayload } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(DB_CLIENT) private readonly db: Db,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<{
    accessToken: string;
    user: PublicUser;
  }> {
    const user = await this.usersService.findByEmail(registerUserDto.email);
    if (user) {
      throw new ConflictException(
        `User with email ${registerUserDto.email} already exists`,
      );
    }

    const hashPassword = await this.hashPassword(registerUserDto.password);

    const createdUser = await this.usersService.create({
      email: registerUserDto.email,
      password: hashPassword,
    });

    return {
      accessToken: this.signToken({
        sub: createdUser.id,
        email: createdUser.email,
        name: createdUser.username,
        role: createdUser.role,
      }),
      user: this.usersService.toPublicUser(createdUser),
    };
  }

  async login(
    loginDto: LoginUserDto,
  ): Promise<{ accessToken: string; user: PublicUser }> {
    const user = await this.validCredentials(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: this.signToken({
        sub: user.id,
        email: user.email,
        name: user.username,
        role: user.role,
      }),
      user: this.usersService.toPublicUser(user),
    };
  }

  async getMe(userId: string): Promise<PublicUser> {
    const user = await this.usersService.findById(userId);

    return this.usersService.toPublicUser(user);
  }

  private async hashPassword(password: string) {
    const SALT_ROUNDS = 10;
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  private signToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  private async validCredentials(
    email: string,
    password: string,
  ): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
