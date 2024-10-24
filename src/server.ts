import Fastify, { type FastifyInstance } from "fastify"
import cookie from "fastify-cookie"

import logger from "./util/logger.ts"
import sql from "./util/db.ts"

import { system } from "./routes/system.ts"
import { user } from "./routes/user.ts"
import { account } from "./routes/account.ts"
import { trip } from "./routes/trip.ts"

export const build = (opts = {}) => {
    const app: FastifyInstance = Fastify(opts)

    app.register(cookie)

    app.register(system)
    app.register(user, { prefix: "/v1/user" })
    app.register(account, { prefix: "/v1/account" })
    app.register(trip, { prefix: "/v1/trip" })

    app.addHook("preClose", () => {
        sql.end()
        logger.info("Shutting down")
    })

    return app
}
