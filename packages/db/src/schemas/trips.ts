import { date, integer, pgTable, text, uuid } from "drizzle-orm/pg-core"
import { createSelectSchema } from "drizzle-zod"
import { z } from "zod"

import { accountsTable } from "./accounts"

export const tripsTable = pgTable("Trips", {
    id: uuid().primaryKey().defaultRandom(),
    from: text().notNull(),
    to: text().notNull(),
    departure: date().notNull(),
    price: integer().notNull(),
    createdAt: date().defaultNow(),
    updatedAt: date().defaultNow(),
    account: uuid()
        .references(() => accountsTable.id)
        .notNull()
})

// TODO(@finxol): use views instead, will enable proper typing
export const TripSelectSchema = createSelectSchema(tripsTable, {
    origin: z.string().optional(),
    email: z.string().optional()
})
export type TripSelect = z.infer<typeof TripSelectSchema>

// export const TripSchema = z.object({
//     id: z.string().uuid(),
//     origin: z.string().optional().nullable(),
//     from: z.string(),
//     to: z.string(),
//     departure: z.string(),
//     price: z.number().min(0),
//     createdAt: z.string().optional().nullable(),
//     updatedAt: z.string().optional().nullable(),
//     account: z.string().uuid(),
//     email: z.string().email().nullable()
// })

// export type Trip = z.infer<typeof TripSchema>

export const NewTripSchema = z.object({
    from: z.string(),
    to: z.string(),
    departure: z.string(),
    price: z.number().min(0),
    account: z.string().uuid()
})

export type NewTrip = z.infer<typeof NewTripSchema>

export const NewTripInputSchema = z.object({
    from: z.string().min(1),
    to: z.string().min(1),
    departure: z.date(),
    price: z.number().min(0)
})

export type NewTripInput = z.infer<typeof NewTripInputSchema>
