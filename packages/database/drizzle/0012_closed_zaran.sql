DELETE FROM "point_game_points";
ALTER TABLE "point_game_points" ALTER COLUMN "point_id" SET DATA TYPE uuid USING point_id::uuid;--> statement-breakpoint
ALTER TABLE "point_game_points" ADD CONSTRAINT "point_game_points_point_id_points_of_interest_id_fk" FOREIGN KEY ("point_id") REFERENCES "public"."points_of_interest"("id") ON DELETE no action ON UPDATE no action;