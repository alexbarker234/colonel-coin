import { integer, pgTable, primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./schema";

export const pointGame = pgTable("point_game", {
    id: uuid("id").primaryKey().defaultRandom(),
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
    pointId: integer("point_id").notNull(),
    gameId: uuid("game_id")
        .references(() => pointGame.id)
        .notNull(),
    claimedByUserId: varchar("claimed_by_user_id").references(() => users.id),
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
});
