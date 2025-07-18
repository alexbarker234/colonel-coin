import { integer, pgTable, primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: varchar("id").primaryKey(),
});

export const userGuilds = pgTable(
    "user_guilds",
    {
        userId: varchar("user_id")
            .references(() => users.id)
            .notNull(),
        guildId: varchar("guild_id").notNull(),
        balance: integer("balance").notNull().default(0),
    },
    (table) => [primaryKey({ columns: [table.userId, table.guildId] })]
);

// Login tokens table for logging into website via URL sent on Discord
export const loginTokens = pgTable("login_tokens", {
    id: uuid("id").primaryKey().defaultRandom(),
    token: varchar("token").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    userId: varchar("user_id")
        .references(() => users.id)
        .notNull(),
});

export const debts = pgTable(
    "debts",
    {
        creditorId: varchar("creditor_id")
            .references(() => users.id)
            .notNull(),
        debtorId: varchar("debtor_id")
            .references(() => users.id)
            .notNull(),
    },
    (table) => [primaryKey({ columns: [table.creditorId, table.debtorId] })]
);

// Bounties table to keep track of released bounties, countains an ID and a date released
export const bounties = pgTable("bounties", {
    id: integer("id").primaryKey(),
    releasedAt: timestamp("released_at").notNull().defaultNow(),
});

// Store the next bounty schedule time
export const bountySchedule = pgTable("bounty_schedule", {
    id: integer("id").primaryKey().default(1),
    nextScheduledTime: timestamp("next_scheduled_time").notNull(),
});

// Guild settings table
export const guildSettings = pgTable("guild_settings", {
    id: varchar("id").primaryKey(),
    bountiesChannelId: varchar("bounties_channel_id"),
    gamesChannelId: varchar("games_channel_id"),
});

// Button game table
export const buttonGame = pgTable("button_game", {
    id: uuid("id").primaryKey().defaultRandom(),
    channelId: varchar("channel_id").notNull(),
    messageId: varchar("message_id").notNull(),
    value: integer("value").notNull(),
});

export const buttonGamePlayers = pgTable(
    "button_game_players",
    {
        gameId: uuid("game_id")
            .references(() => buttonGame.id)
            .notNull(),
        userId: varchar("user_id")
            .references(() => users.id)
            .notNull(),
        score: integer("score").notNull(),
    },
    (table) => [primaryKey({ columns: [table.gameId, table.userId] })]
);
