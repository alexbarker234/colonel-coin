CREATE TABLE "user_guilds" (
	"user_id" varchar NOT NULL,
	"guild_id" varchar NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "user_guilds_user_id_guild_id_pk" PRIMARY KEY("user_id","guild_id")
);
--> statement-breakpoint
ALTER TABLE "user_guilds" ADD CONSTRAINT "user_guilds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "balance";