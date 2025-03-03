import "server-only"

import packageJson from "../../../../../../package.json" with { type: "json" }

export const version = packageJson.version
export const isProduction = process.env.NODE_ENV === "production"
