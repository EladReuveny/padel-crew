import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { CurrentUser } from '../../libs/utils/src/decorators/current-user.decorator';
import { JwtGuard } from '../../libs/utils/src/guards/jwt.guard';
import type { PublicUser } from '../users/types/user.types';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() registerUserDto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicUser> {
    const { user, accessToken } =
      await this.authService.register(registerUserDto);

    res.cookie('access-token', accessToken, {
      httpOnly: true,
      sameSite:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'none'
          : 'lax',
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      maxAge:
        this.configService.get<number>('JWT_EXPIRES_IN_MS') ??
        1000 * 60 * 60 * 24 * 7, // 7 days in ms
    });

    return user;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicUser> {
    const { user, accessToken } = await this.authService.login(loginUserDto);

    res.cookie('access-token', accessToken, {
      httpOnly: true,
      sameSite:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'none'
          : 'lax',
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      maxAge:
        this.configService.get<number>('JWT_EXPIRES_IN_MS') ??
        1000 * 60 * 60 * 24 * 7, // 7 days in ms
    });

    return user;
  }

  @Get('me')
  @UseGuards(JwtGuard)
  getMe(@CurrentUser('sub') userId: string): Promise<PublicUser> {
    return this.authService.getMe(userId);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response): { message: string } {
    res.clearCookie('access-token');

    return { message: 'Logged out successfully' };
  }
}
