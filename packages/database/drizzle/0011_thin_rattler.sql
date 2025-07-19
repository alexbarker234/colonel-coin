CREATE TABLE "guilds" (
	"id" varchar PRIMARY KEY NOT NULL
);
INSERT INTO "guilds" ("id")
SELECT DISTINCT "id" FROM "guild_settings"
ON CONFLICT ("id") DO NOTHING;

--> statement-breakpoint
ALTER TABLE "points_of_interest" ADD CONSTRAINT "points_of_interest_guild_id_guilds_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guild_settings" ADD CONSTRAINT "guild_settings_id_guilds_id_fk" FOREIGN KEY ("id") REFERENCES "public"."guilds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_guilds" ADD CONSTRAINT "user_guilds_guild_id_guilds_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE no action ON UPDATE no action;