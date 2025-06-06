import { API_PORT, LOG_LEVEL, logLevels, PRODUCTION } from "@karr/config"
import logger from "@karr/logger"
import { serve } from "srvx"
import { drizzleMigrate } from "@/db/migrate"
import { app } from "@/server"

if (PRODUCTION && logLevels.findIndex((l) => l === LOG_LEVEL) < 2) {
    logger.warn(
        `Log level is set to '${LOG_LEVEL}' in a production environment.`,
        "This may result in an excessive amount of logs.",
        "/!\\ It may also log sensitive infornmation",
        "Consider setting LOG_LEVEL to 'info' or 'warn' in .env or config"
    )
}

logger.info(`TZ=${Intl.DateTimeFormat().resolvedOptions().timeZone}`)

// Run database migrations
await drizzleMigrate()

// Start the server
const server = serve({
    fetch: app.fetch,
    port: API_PORT,
    hostname: "0.0.0.0",
    silent: true
})

await server.ready()

logger.success(
    `Server listening on ${server.url} in ${PRODUCTION ? "production" : "dev"} mode`
)
