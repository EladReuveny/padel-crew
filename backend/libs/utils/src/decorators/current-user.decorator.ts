import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload, RequestWithUser } from 'src/auth/types/auth.types';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    return data && req.user ? req.user[data] : req.user;
  },
);
