DROP INDEX "games_date_idx";--> statement-breakpoint
CREATE INDEX "games_creator_id_idx" ON "games" ("creator_id");--> statement-breakpoint
CREATE INDEX "games_status_idx" ON "games" ("status");