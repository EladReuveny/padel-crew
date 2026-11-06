import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, RequestWithUser } from 'src/auth/types/auth.types';
import { UsersService } from '../../../../src/users/users.service';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractToken(req);

    if (!token) {
      throw new UnauthorizedException('Invalid or missing token.');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);

      req.user = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }

  private extractToken(req: RequestWithUser): string | null {
    const cookieToken = req.cookies?.['access-token'] as string | null;
    if (cookieToken) {
      return cookieToken;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
