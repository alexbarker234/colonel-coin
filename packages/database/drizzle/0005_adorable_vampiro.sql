CREATE TABLE "point_game" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" varchar NOT NULL,
	"message_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "point_game_players" (
	"game_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"score" integer NOT NULL,
	CONSTRAINT "point_game_players_game_id_user_id_pk" PRIMARY KEY("game_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "point_game_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"point_id" integer NOT NULL,
	"game_id" uuid NOT NULL,
	"claimed_by_user_id" varchar,
	"claimed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "point_game_players" ADD CONSTRAINT "point_game_players_game_id_point_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."point_game"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_game_players" ADD CONSTRAINT "point_game_players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_game_points" ADD CONSTRAINT "point_game_points_game_id_point_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."point_game"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_game_points" ADD CONSTRAINT "point_game_points_claimed_by_user_id_users_id_fk" FOREIGN KEY ("claimed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;