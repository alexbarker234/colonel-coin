CREATE TABLE "points_of_interest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"guild_id" varchar NOT NULL,
	"latitude" numeric NOT NULL,
	"longitude" numeric NOT NULL
);
