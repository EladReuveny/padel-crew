import { Role } from '@app/infra/db/schema.types';
import { Request } from 'express';

export type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  role: Role;
};

export type RequestWithUser = Request & {
  user?: JwtPayload;
};
