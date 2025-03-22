import { Hono } from "hono"
import { cors } from "hono/cors"
import { secureHeaders } from "hono/secure-headers"
import { validator } from "hono/validator"

import { API_VERSION, FEDERATION, PRODUCTION } from "@karr/config"
import logger from "@karr/util/logger"

import { isAuthenticated } from "@/lib/auth"
import { responseErrorObject } from "@/lib/helpers"
import account from "@/routes/account"
import auth from "@/routes/auth"
import federation from "@/routes/federation"
import system from "@/routes/system"
import trips from "@/routes/trips"
import user from "@/routes/user"

/**
 * Setup the Hono app with all the routes and plugins
 * @param opts Hono options
 * @returns Hono app
 */
export const build = (): Hono => {
    const hono: Hono = new Hono()

    // ============================
    // ==== Unprotected routes ====
    // ============================
    const unprotectedRoutes = new Hono()
    unprotectedRoutes.route("/", system)
    unprotectedRoutes.route(`/${API_VERSION}/auth`, auth)

    // ============================
    // ====== Regular routes ======
    // ============================
    const protectedRoutes = new Hono().basePath(`/${API_VERSION}`)
    protectedRoutes.route("/user", user)
    protectedRoutes.route("/account", account)
    protectedRoutes.route("/trips", trips)

    // auth check middleware
    protectedRoutes.use(
        validator("cookie", async (_value, c) => {
            const authed = await isAuthenticated(c)

            if (!authed) {
                logger.error("Unauthorized request")
                return responseErrorObject(c, "Unauthorized", 401)
            }
        })
    )

    // ============================
    // ===== Federation routes ====
    // ============================
    if (FEDERATION) {
        const federationRoutes = new Hono().basePath(`/${API_VERSION}/federation`)
        federationRoutes.route("/", federation)

        hono.route("/", federationRoutes)
    }

    // Add CORS middleware
    hono.use(
        "/*",
        cors({
            origin: [
                (PRODUCTION ? process.env.WEB_URL : null) || "http://localhost:3000"
            ],
            credentials: true,
            allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowHeaders: ["Content-Type", "Authorization"],
            exposeHeaders: ["Content-Length"],
            maxAge: 600
        })
    )

    // TODO(@finxol): fix security headers
    hono.use(
        "*",
        secureHeaders({
            xFrameOptions: false,
            xXssProtection: false
        })
    )

    hono.route("/", unprotectedRoutes)
    hono.route("/", protectedRoutes)

    return hono
}
