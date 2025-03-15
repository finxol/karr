import { and, eq, getTableColumns } from "drizzle-orm"
import { z } from "zod"

import drizzle from "@karr/db"
import { accountsTable } from "@karr/db/schemas/accounts.js"
import {
    NewTripSchema,
    TripSelectSchema,
    tripsTable,
    type NewTrip,
    type TripSelect
} from "@karr/db/schemas/trips.js"
import logger from "@karr/util/logger"

export async function getTrips() {
    const trips = await drizzle
        .select({
            ...getTableColumns(tripsTable),
            email: accountsTable.email
        })
        .from(tripsTable)
        .leftJoin(accountsTable, eq(tripsTable.account, accountsTable.id))
    return TripSelectSchema.array().parse(trips)
}

export async function getUserTrips(userId: string): Promise<TripSelect[]> {
    const trips = await drizzle
        .select()
        .from(tripsTable)
        .where(eq(tripsTable.account, userId))
    return TripSelectSchema.array().parse(trips)
}

export async function addTrip(trip: NewTrip): Promise<{ id: string }> {
    const t = NewTripSchema.parse(trip)
    const inserted = await drizzle
        .insert(tripsTable)
        .values(t)
        .returning({ id: tripsTable.id })

    if (!inserted || inserted.length === 0 || !inserted[0]) {
        logger.debug("Failed to insert trip:", inserted)
        throw new Error("Failed to insert trip")
    }

    const InsertedTripSchema = z.object({
        id: z.string().uuid()
    })

    return InsertedTripSchema.parse(inserted[0])
}

export async function deleteTrip(tripId: string, userId: string): Promise<boolean> {
    await drizzle
        .delete(tripsTable)
        .where(and(eq(tripsTable.id, tripId), eq(tripsTable.account, userId)))
    return true
}
