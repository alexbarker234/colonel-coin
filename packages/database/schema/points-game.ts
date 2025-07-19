import { decimal, integer, pgTable, primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { guilds, users } from "./schema";

// Each guild has a customisable list of points of interest
export const pointsOfInterest = pgTable("points_of_interest", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name").notNull(),
    guildId: varchar("guild_id")
        .references(() => guilds.id)
        .notNull(),
    latitude: decimal("latitude").notNull(),
    longitude: decimal("longitude").notNull(),
});

export const pointGame = pgTable("point_game", {
    id: uuid("id").primaryKey().defaultRandom(),
    gameStartedAt: timestamp("game_started_at", { withTimezone: true }).defaultNow().notNull(),
    // Used to update a message with the latest points
    channelId: varchar("channel_id").notNull(),
    messageId: varchar("message_id").notNull(),
});

export const pointGamePlayers = pgTable(
    "point_game_players",
    {
        gameId: uuid("game_id")
            .references(() => pointGame.id)
            .notNull(),
        userId: varchar("user_id")
            .references(() => users.id)
            .notNull(),
        score: integer("score").notNull(),
    },
    (table) => [primaryKey({ columns: [table.gameId, table.userId] })]
);

export const pointGamePoints = pgTable("point_game_points", {
    id: uuid("id").primaryKey().defaultRandom(),
    pointId: varchar("point_id").notNull(),
    gameId: uuid("game_id")
        .references(() => pointGame.id)
        .notNull(),
    claimedByUserId: varchar("claimed_by_user_id").references(() => users.id),
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
});
