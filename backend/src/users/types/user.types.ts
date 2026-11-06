import { User } from '@app/infra/db/schema.types';

export type PublicUser = Omit<User, 'hashPassword'>;
