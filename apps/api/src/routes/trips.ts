import { Hono } from "hono"
import { streamSSE } from "hono/streaming"

import { NewTrip, NewTripSchema, Trip } from "@karr/db/schemas/trips.js"
import logger from "@karr/util/logger"

import { handleRequest, responseErrorObject } from "@/lib/helpers"
import type { DataResponse } from "@/lib/types.d.ts"
import { addTrip, deleteTrip, getTrips } from "@/db/trips"

import { getFederatedTrips } from "./federation/helpers"

const hono = new Hono()

/**
 * Search for a trip locally and on federated servers
 * @param from The starting location. Coordinates in the format "lat,lon"
 * @param to The destination location. Coordinates in the format "lat,lon"
 * @param date The date of the trip. Format "YYYY-MM-DD"
 * @returns The list of trips, including those from federated servers. The list is sent as an SSE stream.
 */
hono.get("/search", (c) => {
    return streamSSE(c, async (stream) => {
        const _from = c.req.query("from")
        const _to = c.req.query("to")
        const _date = c.req.query("date")

        const tripsToSend: Promise<void>[] = []

        // TODO(@finxol): Fix the type of data
        function sendData(data: Trip[]) {
            logger.debug(`Sending ${data.length} trips`, data)
            for (const item of data) {
                tripsToSend.push(
                    stream.writeSSE({
                        data: JSON.stringify(item),
                        event: "new-trip",
                        id: item.id
                    })
                )
            }
        }

        try {
            // Get the trips from the local server
            const immediatePromise = getTrips().then((data) => {
                if (data.isErr()) {
                    stream.writeSSE({
                        data: JSON.stringify(data.error),
                        event: "error",
                        id: crypto.randomUUID()
                    })
                    return Promise.reject(data.error)
                }

                sendData(data.value)
            })

            // Get the trips from the federated servers
            const slowerPromises: Promise<void>[] = [
                getFederatedTrips().then(sendData)
                // getSlowerData().then(sendData)
            ]

            await Promise.allSettled([
                ...tripsToSend,
                immediatePromise,
                ...slowerPromises
            ])
            logger.debug("All data sent")
        } catch (error) {
            stream.close()
            logger.error("Error sending SSE data:", error)
        }
    })
})

/**
 * Add a trip
 * @param id The ID of the account that is adding the trip
 * @returns The trip id and name
 */
hono.post("/add", async (c) => {
    //@ts-expect-error valid does take in a parameter
    const { id } = c.req.valid("cookie")

    const t = await c.req.json<NewTrip>()
    t.account = id
    const trip = NewTripSchema.safeParse(t)

    if (!trip.success) {
        return responseErrorObject(
            c,
            { message: "Invalid trip data", cause: trip.error.errors },
            400
        )
    }

    const createdTrip = await addTrip(trip.data)

    if (createdTrip.isErr()) {
        return responseErrorObject(c, createdTrip.error, 400)
    }

    logger.debug(`Added trip:`, createdTrip)

    return c.json(<DataResponse<object>>{
        data: {
            id: createdTrip.value.id,
            name: "Test Trip"
        }
    })
})

/**
 * Delete a trip by ID
 * @param id The ID of the trip
 * @returns The trip
 */
hono.delete("/:id{[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}}", (c) => {
    //@ts-expect-error valid does take in a parameter
    const { id } = c.req.valid("cookie")

    const tripId: string = c.req.param("id")

    logger.debug(`Deleting trip: ${id}`)
    return handleRequest(c, () => deleteTrip(tripId, id))
})

/**
 * Get a trip by ID
 * @param id The ID of the trip
 * @returns The trip
 */
hono.get("/:id", (c) => {
    const id: string = c.req.param("id")
    logger.debug(`Getting trip by ID: ${id}`)
    logger.warn('"/:id"', "Are you sure this is the route you wanted to hit?")
    return c.json(<DataResponse<object>>{
        data: {
            id: id,
            name: "Test Trip"
        }
    })
})

export default hono
