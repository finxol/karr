import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core"
import { createSelectSchema } from "drizzle-zod"
import { z } from "zod"

import { usersTable } from "./users"

export const accountsTable = pgTable("Accounts", {
    id: uuid().primaryKey().defaultRandom(),
    email: text().unique().notNull(),
    password: text().notNull(),
    token: text(),
    blocked: boolean().default(false),
    verified: boolean().default(false),
    user: uuid()
        // .notNull()
        .references(() => usersTable.id)
})

export const accountsSelectSchema = createSelectSchema(accountsTable)
export type AccountsSelect = z.infer<typeof accountsSelectSchema>
