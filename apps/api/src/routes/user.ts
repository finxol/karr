import { Hono } from "hono"

import { handleRequest, responseErrorObject, tmpResponse } from "@/lib/helpers"
import type { UserWithPrefsAndStatus as _UserWithPrefsAndStatus } from "@/lib/types.d.ts"
import { selectUserById, selectUserProfileById, updateNickname } from "@/db/users"

const hono = new Hono()

// ==============================================
// ========== Register endpoint routes ==========
// ==============================================

/**
 * Get logged in user's info
 * @returns Object containing user info
 */
hono.get("/", async (c) => {
    // get the user ID from the validated headers
    //@ts-expect-error valid does take in a parameter
    const { id } = c.req.valid("cookie")

    // get the user from the database and send it back
    return await handleRequest<unknown>(c, () => selectUserById(id))
})

/**
 * Change the logged in user's nickname
 * @returns {Response} Data response if update was successful, ErrorResponse if not
 */
hono.put("/nickname", async (c) => {
    // TODO(@finxol): Add validation for nickname
    // get the user ID from the validated headers
    //@ts-expect-error valid does take in a parameter
    const { id } = c.req.valid("cookie")
    const { nickname } = await c.req.json()

    // check the nickname is a valid string
    if (typeof nickname !== "string" || nickname.length < 1) {
        return responseErrorObject(c, new Error("Invalid nickname"), 400)
    }

    // update the user's nickname in the database
    return await handleRequest<boolean>(c, () => updateNickname(id, nickname))
})

/**
 * Update the logged in user's preferences
 * __Not implemented yet__
 * @returns {Response} DataResponse if update was successful, ErrorResponse if not
 */
hono.put("/preferences", (c) => {
    // TODO(@finxol): Implement this
    return tmpResponse(c)
})

/**
 * Get complete list of logged in user's trips
 * __Not implemented yet__
 * @returns {object} - Object containing list of trips
 */
hono.get("/trips", (c) => {
    // TODO(@finxol): Implement this
    return tmpResponse(c)
})

/**
 * Get all bookings for the logged in user
 * __Not implemented yet__
 * @returns {Response} DataResponse if fetch was successful, ErrorResponse if not
 */
hono.get("/bookings", (c) => {
    // TODO(@finxol): Implement this
    return tmpResponse(c)
})

/**
 * Get specific booking details. The logged in user must be concerned with the booking
 * __Not implemented yet__
 * @returns {Response} DataResponse if fetch was successful, ErrorResponse if not
 */
hono.get("/bookings/:id", (c) => {
    // TODO(@finxol): Implement this
    return tmpResponse(c)
})

/**
 * Delete a specific booking. The logged in user must be concerned with the booking
 * __Not implemented yet__
 * @returns {Response} DataResponse if deletion was successful, ErrorResponse if not
 */
hono.delete("/bookings/:id", (c) => {
    // TODO(@finxol): Implement this
    return tmpResponse(c)
})

/**
 * Get the public profile of a user. Only limited information is available.
 * @param {string} id - The user ID. Must be a valid UUID v4
 * @returns {Response} DataResponse if fetch was successful, ErrorResponse if not
 */
hono.get(
    "/profile/:id{[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}}",
    async (c) => {
        // get the user ID from the validated headers
        //@ts-expect-error valid does take in a parameter
        const { id } = c.req.valid("cookie")

        // get the user from the database and send it back
        return await handleRequest(c, () => selectUserProfileById(id))
    }
)

export default hono
