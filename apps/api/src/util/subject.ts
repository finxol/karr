import type { UserSubject } from "@karr/auth/subjects"
import logger from "@karr/logger"
import type { Context } from "hono"

export function getUserSub(c: Context) {
    // Get the subject from the context
    const subject = c.get("userSubject") as UserSubject | undefined

    logger.debug("User subject", subject)

    // Middleware should prevent this, but good practice to check
    if (!subject?.properties?.id) {
        logger.error("User subject missing in context for GET /user")
        return null
    }

    return subject.properties
}
