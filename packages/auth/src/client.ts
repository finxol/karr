import { createClient } from "@openauthjs/openauth/client"

import { API_BASE, API_VERSION } from "@karr/config"

export const client = createClient({
    clientID: "nextjs",
    issuer: `${API_BASE}/${API_VERSION}/auth`
})

export const callbackUrl = `${API_BASE}/${API_VERSION}/auth/callback`
