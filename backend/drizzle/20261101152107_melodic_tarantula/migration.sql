CREATE TYPE "status" AS ENUM('WAITING_FOR_PLAYERS', 'READY', 'IN_PROGRESS', 'FINISHED');--> statement-breakpoint
CREATE TYPE "role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" varchar(255),
	"location" varchar(255) NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "status" DEFAULT 'WAITING_FOR_PLAYERS'::"status" NOT NULL,
	"creator_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" varchar(255) NOT NULL UNIQUE,
	"username" varchar(255) NOT NULL,
	"hash_password" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'USER'::"role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_games" (
	"game_id" uuid,
	"player_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_games_pkey" PRIMARY KEY("game_id","player_id")
);
--> statement-breakpoint
CREATE INDEX "games_location_idx" ON "games" ("location");--> statement-breakpoint
CREATE INDEX "games_date_idx" ON "games" ("date");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" ("email");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" ("username");--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_creator_id_users_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "users_games" ADD CONSTRAINT "users_games_game_id_games_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "users_games" ADD CONSTRAINT "users_games_player_id_users_id_fkey" FOREIGN KEY ("player_id") REFERENCES "users"("id") ON DELETE CASCADE;