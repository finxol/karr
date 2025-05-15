import logger from "@karr/logger"
import { and, eq, getTableColumns } from "drizzle-orm"
import { err, ok } from "neverthrow"
import { z } from "zod/v4"
import drizzle from "@/db"
import { profileTable } from "@/db/schemas/profile"
import {
    type NewTrip,
    NewTripSchema,
    TripSchema,
    tripsTable
} from "@/db/schemas/trips"

export async function getTrips() {
    const trips = await drizzle
        .select({
            ...getTableColumns(tripsTable),
            firstName: profileTable.firstName,
            lastName: profileTable.lastName,
            nickname: profileTable.nickname
        })
        .from(tripsTable)
        .leftJoin(profileTable, eq(tripsTable.account, profileTable.id))

    const t = TripSchema.array().safeParse(trips)
    if (!t.success) {
        logger.debug("Failed to parse trips:", t.error)
        return err("Failed to parse trips")
    }

    return ok(t.data)
}

export async function getUserTrips(userId: string) {
    const trips = await drizzle
        .select()
        .from(tripsTable)
        .where(eq(tripsTable.account, userId))

    const u = TripSchema.array().safeParse(trips)
    if (!u.success) {
        logger.debug("Failed to parse user trips:", u.error)
        return err("Failed to parse user trips")
    }

    return ok(u.data)
}

export async function addTrip(trip: NewTrip | { departure: Date }) {
    const t = NewTripSchema.safeParse(trip)

    if (!t.success) {
        logger.debug("Failed to parse trip:", t.error)
        return err("Failed to parse trip")
    }

    const inserted = await drizzle
        .insert(tripsTable)
        .values(t.data)
        .returning({ id: tripsTable.id })

    if (!inserted || inserted.length === 0 || !inserted[0]) {
        logger.debug("Failed to insert trip:", inserted)
        return err("Failed to insert trip")
    }

    const InsertedTripSchema = z.object({
        id: z.string().uuid()
    })

    const insertedTrip = InsertedTripSchema.safeParse(inserted[0])

    if (!insertedTrip.success) {
        logger.debug("Failed to parse inserted trip:", insertedTrip.error)
        return err("Failed to parse inserted trip")
    }

    return ok(insertedTrip.data)
}

export async function deleteTrip(
    tripId: string,
    userId: string
): Promise<boolean> {
    await drizzle
        .delete(tripsTable)
        .where(and(eq(tripsTable.id, tripId), eq(tripsTable.account, userId)))
    return true
}
