import { issuer } from "@openauthjs/openauth"
import { GithubProvider } from "@openauthjs/openauth/provider/github"
import { MemoryStorage } from "@openauthjs/openauth/storage/memory"
import { Select } from "@openauthjs/openauth/ui/select"
import { THEME_SST } from "@openauthjs/openauth/ui/theme"
import { setCookie } from "hono/cookie"

import { callbackUrl, client } from "@karr/auth/client"
import { subjects } from "@karr/auth/subjects"

//import { UnStorage } from "./unstorage-adapter"

async function getUser(provider: string, email: string) {
    console.log(provider, email)
    // Get user from database and return user ID
    return "123"
}

const app = issuer({
    select: Select({
        providers: {
            github: {
                display: "GitHub"
            }
        }
    }),
    providers: {
        github: GithubProvider({
            clientSecret: "fc0f07b9daf343cd160226990cb55519c5cfb728",
            clientID: "Ov23lic9kjugi9TMB1oj",
            scopes: ["email"]
        })
    },
    storage: MemoryStorage(), //UnStorage()
    subjects,
    theme: THEME_SST,
    async allow(input, _req) {
        console.log("Allow check:", {
            audience: input.audience,
            clientID: input.clientID,
            redirectURI: input.redirectURI
        })

        return true // For testing, allow all
    },
    async success(ctx, value) {
        if (value.provider === "github") {
            console.log(value.tokenset.access)
            return ctx.subject("user", {
                userID: await getUser(value.provider, value.clientID)
            })
        }
        throw new Error("Invalid provider")
    }
})

app.get("/callback", async (ctx) => {
    const url = new URL(ctx.req.url)
    const code = ctx.req.query("code")
    const next = ctx.req.query("next") ?? `${url.origin}/`

    if (!code) return ctx.json({ error: "No code provided" }, 400)

    console.log(callbackUrl)

    const exchanged = await client.exchange(code, callbackUrl)

    if (exchanged.err) return ctx.json(exchanged.err, 400)

    setCookie(ctx, "access_token", exchanged.tokens.access, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 34560000
    })
    setCookie(ctx, "refresh_token", exchanged.tokens.refresh, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 34560000
    })

    return ctx.redirect(next)
})

export default app
