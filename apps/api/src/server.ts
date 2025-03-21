import { Hono } from "hono"
import { getCookie } from "hono/cookie"
import { cors } from "hono/cors"
import { showRoutes } from "hono/dev"
import { validator } from "hono/validator"

import { API_VERSION, FEDERATION, PRODUCTION } from "@karr/config"

import { getAccount } from "@/lib/auth"
import { responseErrorObject } from "@/lib/helpers"
import account from "@/routes/account"
//import auth from "@/routes/auth"
import auth from "@/routes/auth/issuer"
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

    // TODO(@finxol): Add security headers

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

    // ============================
    // ==== Unprotected routes ====
    // ============================
    hono.route("/", system)
    hono.route(`/${API_VERSION}/auth`, auth)

    // =============================
    // ======== Middlewares ========
    // =============================
    /**
     * Check if a user is logged in by checking the Authorization header
     */
    hono.use(
        validator("cookie", async (value, c) => {
            const authtoken = getCookie(c, "auth-token")

            if (authtoken === undefined || authtoken === "") {
                return responseErrorObject(
                    c,
                    {
                        message: "Unauthorized",
                        cause: "Auth token is required in cookie"
                    },
                    401
                )
            }

            const acc = await getAccount(authtoken)

            if (acc.isErr()) {
                return responseErrorObject(
                    c,
                    {
                        message: "Unauthorized",
                        cause: "Invalid authorization token"
                    },
                    401
                )
            }

            // TODO(@finxol): verify the JWT
            const id =
                // very unsafe, but it's just for the PoC
                authtoken === "federation" ? "federation" : acc.value

            return { id }
        })
    )

    // ============================
    // ===== Protected routes =====
    // ============================
    hono.route(`/${API_VERSION}/user`, user)
    hono.route(`/${API_VERSION}/account`, account)
    hono.route(`/${API_VERSION}/trips`, trips)

    if (FEDERATION) {
        hono.route(`/${API_VERSION}/federation`, federation)
    }

    showRoutes(hono, {
        verbose: true
    })

    return hono
}
