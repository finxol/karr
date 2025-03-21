import type { Context } from "hono"
import { ContentfulStatusCode } from "hono/utils/http-status"

import { ADMIN_EMAIL } from "@karr/config"
import { tryCatch } from "@karr/util"
import logger from "@karr/util/logger"

/**
 * Template for a function that returns a response object
 * @param c The Hono context object
 * @returns The response object
 */
export function tmpResponse(c: Context) {
    c.status(418)
    return c.json({
        // get timestamp from the current time using Date
        timestamp: new Date().getTime(),
        data: {
            message: "I'm a teapot",
            img: "https://http.cat/images/418.jpg"
        }
    })
}

/**
 * Helper function to create a response object
 * @param message The error message
 * @param args Any additional arguments
 * @returns The error response object
 */
export function responseErrorObject(
    c: Context,
    error: Error | string | { cause?: string | unknown; message: string },
    code: ContentfulStatusCode = 500
) {
    return c.json(
        {
            timestamp: new Date().getTime(),
            contact: ADMIN_EMAIL,
            error
        },
        code
    )
}

/**
 * Helper function which accepts any function
 * and wraps it in a try-catch block
 * Appropriately handles the response object and status code
 * @param c The Hono context object
 * @param fn The function to wrap
 * @returns The result of the function or an error object
 */
export async function handleRequest<T>(c: Context, fn: () => Promise<T>) {
    const out = await tryCatch(fn())

    if (out.error) {
        logger.error(out.error)
        return responseErrorObject(
            c,
            { message: "Internal server error", cause: out.error },
            500
        )
    }

    if (!out.value) {
        return responseErrorObject(c, { message: "Resource not found" }, 404)
    }

    return c.json({
        timestamp: new Date().getTime(),
        data: out
    })
}

/**
 * Middleware to check the content type of a request
 * The content type must be application/json
 * @param c The Hono context object
 * @param done The callback to continue the request
 */
export function checkContentType(c: Context, done: () => void) {
    if (c.req.header("content-type") !== "application/json") {
        c.status(400)
        return responseErrorObject(
            c,
            new Error("Invalid content type. Must be application/json"),
            400
        )
    } else {
        done()
    }
}
