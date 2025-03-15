import { defineConfig } from "drizzle-kit"

import { getDbConfig } from "@karr/config"

const config = getDbConfig()

export default defineConfig({
    out: "./migrations",
    schema: "./src/schemas/*.ts",
    dialect: "postgresql",
    dbCredentials: {
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.name
    }
})
