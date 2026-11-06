import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

export type Db = NodePgDatabase<typeof schema.relations>;

export type Role = typeof schema.users.$inferSelect.role;
export type GameStatus = typeof schema.games.$inferSelect.status;

export type User = typeof schema.users.$inferSelect;
export type CreateUserDto = typeof schema.users.$inferInsert;

export type Game = typeof schema.games.$inferSelect;
export type CreateGameDto = typeof schema.games.$inferInsert;
