import { defineRelations } from 'drizzle-orm';
import {
  index,
  pgEnum,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['USER', 'ADMIN']);
export const gameStatusEnum = pgEnum('status', [
  'WAITING_FOR_PLAYERS',
  'READY',
  'IN_PROGRESS',
  'FINISHED',
]);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    username: varchar('username', { length: 255 }).notNull(),
    hashPassword: varchar('hash_password', { length: 255 }).notNull(),
    role: roleEnum('role').notNull().default('USER'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index('users_email_idx').on(t.email),
    index('users_username_idx').on(t.username),
  ],
);

export const games = pgTable(
  'games',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }),
    location: varchar('location', { length: 255 }).notNull(),
    date: timestamp('date', { withTimezone: true }).notNull().defaultNow(),
    status: gameStatusEnum('status').notNull().default('WAITING_FOR_PLAYERS'),
    creatorId: uuid('creator_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index('games_location_idx').on(t.location),
    index('games_creator_id_idx').on(t.creatorId),
    index('games_status_idx').on(t.status),
  ],
);

export const usersGames = pgTable(
  'users_games',
  {
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    playerId: uuid('player_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [primaryKey({ columns: [t.gameId, t.playerId] })],
);

export const schema = { users, games, usersGames };

export const relations = defineRelations(schema, (r) => ({
  users: {
    joinedGames: r.many.games({
      from: r.users.id.through(r.usersGames.playerId),
      to: r.games.id.through(r.usersGames.gameId),
    }),
    createdGames: r.many.games({
      from: r.users.id,
      to: r.games.creatorId,
    }),
  },
  games: {
    players: r.many.users({
      from: r.games.id.through(r.usersGames.gameId),
      to: r.users.id.through(r.usersGames.playerId),
    }),
    creator: r.one.users({
      from: r.games.creatorId,
      to: r.users.id,
    }),
  },
}));
