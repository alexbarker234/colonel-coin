DELETE FROM "point_game_players";
DELETE FROM "point_game";
ALTER TABLE "point_game" ADD COLUMN "guild_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "point_game" ADD CONSTRAINT "point_game_guild_id_guilds_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE no action ON UPDATE no action;