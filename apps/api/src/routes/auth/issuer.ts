import { issuer } from "@openauthjs/openauth"
import { Select } from "@openauthjs/openauth/ui/select"
import type { Theme } from "@openauthjs/openauth/ui/theme"
import type { Tokens } from "@openauthjs/openauth/client"
import { setCookie } from "hono/cookie"
import type { Context } from "hono"
import { createDatabase } from "db0"
import sqlite from "db0/connectors/node-sqlite"
import dbDriver from "unstorage/drivers/db0"

import { subjects, UserProperties } from "@karr/auth/subjects"
import { authBaseUrl } from "@karr/auth/client"
import { API_BASE } from "@karr/config"
import { logger } from "@karr/logger"

import { callbackUrl, client } from "@/lib/auth-client"

import { UnStorage } from "./unstorage-adapter"
import { providers } from "./providers"
import type { SuccessValues } from "./sucess"
import { getGithubUserData } from "./profile-fetchers/github"
import { getGoogleUserData } from "./profile-fetchers/google"
import { getOrInsertUser } from "./persistence"
import { Result } from "neverthrow"
import { ErrorResponse } from "@/lib/types"

const database = createDatabase(
    sqlite({
        name: "openauth"
    })
)

const theme: Theme = {
    title: "Karr Auth",
    logo: "/logo-tmp.jpg",
    background: {
        dark: "hsl(132 2% 10%)",
        light: "hsl(140 20% 97%)"
    },
    primary: {
        dark: "hsl(132 74% 32%)",
        light: "hsl(132 64% 32%)"
    },
    font: {
        family: "Varela Round, sans-serif"
    },
    css: `
        html {
            --border-radius: 2.8 !important;
        }
    `
}

const app = issuer({
    basePath: authBaseUrl(API_BASE),
    select: Select({}),
    providers,
    storage: UnStorage({
        driver: dbDriver({
            database,
            tableName: "openauth"
        })
    }),
    subjects,
    theme,
    async allow(input, _req) {
        return input.redirectURI === callbackUrl && input.clientID === "karr"
    },
    async success(ctx, value: SuccessValues) {
        let subjectData: Result<UserProperties, string>
        if (value.provider === "password") {
            subjectData = await getOrInsertUser({
                provider: value.provider,
                email: value.email
            })
        } else if (value.provider === "code") {
            subjectData = await getOrInsertUser({
                provider: value.provider,
                email: value.claims.email
            })
        } else if (value.provider === "github") {
            // get the user data from github
            const userData = await getGithubUserData(value.tokenset.access)

            if (userData.isErr()) {
                throw new Error(userData.error)
            }

            // save the user data to the database, and return the jwt payload
            subjectData = await getOrInsertUser(userData.value)
        } else if (value.provider === "google") {
            // extract the user data
            const userData = await getGoogleUserData(value.id)

            // save the user data to the database, and return the jwt payload
            subjectData = await getOrInsertUser(userData.value)
        } else {
            // should never happen
            logger.debug("Unknown provider", value)
            throw new Error("Invalid provider")
        }

        if (subjectData.isErr()) {
            throw new Error(subjectData.error)
        }

        return ctx.subject("user", subjectData.value)
    }
})

app.get("/callback", async (ctx) => {
    const url = new URL(ctx.req.url)
    const code = ctx.req.query("code")
    const error = ctx.req.query("error")
    const next = ctx.req.query("next") ?? `${url.origin}/`

    if (error) {
        return ctx.json(
            {
                message: error,
                cause: ctx.req.query("error_description")
            } satisfies ErrorResponse,
            500
        )
    }

    if (!code) {
        return ctx.json(
            {
                message: "Missing code"
            } satisfies ErrorResponse,
            400
        )
    }

    const exchanged = await client.exchange(code, callbackUrl)

    if (exchanged.err)
        return ctx.json(exchanged.err satisfies ErrorResponse, 400)

    setTokens(ctx, exchanged.tokens)

    return ctx.redirect(next)
})

export function setTokens(ctx: Context, tokens: Tokens) {
    setCookie(ctx, "access_token", tokens.access, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: tokens.expiresIn
    })
    setCookie(ctx, "refresh_token", tokens.refresh, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 400 // 400 days
    })
}

export default app
