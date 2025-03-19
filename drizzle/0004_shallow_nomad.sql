CREATE TABLE "fishing_game" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" varchar NOT NULL,
	"message_id" varchar NOT NULL,
	"fish" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fishing_game_players" (
	"game_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"fish_caught" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fishing_game_players" ADD CONSTRAINT "fishing_game_players_game_id_fishing_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."fishing_game"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fishing_game_players" ADD CONSTRAINT "fishing_game_players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;