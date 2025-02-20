import { integer, pgTable, primaryKey, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: varchar("id").primaryKey(),
    balance: integer("balance").notNull().default(0)
});

export const debts = pgTable(
    "debts",
    {
        creditorId: varchar("creditor_id")
            .references(() => users.id)
            .notNull(),
        debtorId: varchar("debtor_id")
            .references(() => users.id)
            .notNull()
    },
    (table) => [primaryKey({ columns: [table.creditorId, table.debtorId] })]
);

// Bounties table to keep track of released bounties, countains an ID and a date released
export const bounties = pgTable("bounties", {
    id: integer("id").primaryKey(),
    releasedAt: timestamp("released_at").notNull().defaultNow()
});

// Guild settings table
export const guildSettings = pgTable("guild_settings", {
    id: varchar("id").primaryKey(),
    bountiesChannelId: varchar("bounties_channel_id")
});
