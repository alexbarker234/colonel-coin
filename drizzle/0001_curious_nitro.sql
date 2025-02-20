CREATE TABLE "bounties" (
	"id" integer PRIMARY KEY NOT NULL,
	"released_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guild_settings" (
	"id" varchar PRIMARY KEY NOT NULL,
	"bounties_channel_id" varchar
);
