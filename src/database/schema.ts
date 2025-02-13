import { integer, text, real, primaryKey, pgTable } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: integer("id").primaryKey(),
    username: text("username").notNull().unique(),
    balance: real("balance").notNull().default(0),
});

export const debts = pgTable(
    "debts",
    {
        creditorId: integer("creditor_id").notNull(),
        debtorId: integer("debtor_id").notNull(),
        amount: real("amount").notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.creditorId, table.debtorId] }),
    })
);
