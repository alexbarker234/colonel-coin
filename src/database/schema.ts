import { integer, text, real, primaryKey, pgTable, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: varchar("id").primaryKey(),
    balance: integer("balance").notNull().default(0),
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
