CREATE TABLE "button_game" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" varchar NOT NULL,
	"message_id" varchar NOT NULL,
	"value" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "button_game_players" (
	"game_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"score" integer NOT NULL,
	CONSTRAINT "button_game_players_game_id_user_id_pk" PRIMARY KEY("game_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "button_game_players" ADD CONSTRAINT "button_game_players_game_id_button_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."button_game"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "button_game_players" ADD CONSTRAINT "button_game_players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;