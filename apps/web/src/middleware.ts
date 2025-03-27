import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { type Session } from "@ory/client"
import createMiddleware from "next-intl/middleware"

import { getFrontendApi } from "@karr/ory/sdk/server"

import { routing } from "@/i18n/routing"

const i18nMiddleware = createMiddleware(routing)

const PRODUCTION = process.env.NODE_ENV === "production"

const logger = {
    log: (...message: unknown[]) => {
        if (!PRODUCTION) console.log(...message)
    },
    error: (...message: unknown[]) => {
        console.error(...message)
    }
}

export async function middleware(request: NextRequest) {
    // i18n check
    const response = i18nMiddleware(request)
    const locale = request.nextUrl.pathname.split("/")[1]

    // Ory session check
    const api = await getFrontendApi()

    const session: Session | null = await api
        .toSession({
            cookie: `ory_kratos_session=${request.cookies.get("ory_kratos_session")?.value}`
        })
        .then((response) => {
            return response.data
        })
        .catch((err) => {
            //if (!PRODUCTION) logger.error("ERROR", err)
            return null
        })

    const authPaths = ["/trips", "/account"]
    const isAuthRequired = authPaths.some((path) =>
        request.nextUrl.pathname.includes(path)
    )

    logger.log("IS AUTH REQUIRED", isAuthRequired)
    //logger.log("SESSION", session)

    if (isAuthRequired && !session) {
        logger.log("NO SESSION", request.nextUrl.pathname)

        return NextResponse.redirect(
            new URL(
                `/${locale}/auth/login?return_to=${request.nextUrl.pathname}`,
                request.url
            )
        )
    }

    if (session) logger.log("SESSION EXISTS", request.nextUrl.pathname)

    return response
}

export const config = {
    matcher: ["/trips/:path*", "/account", "/", `/(fr|en)/:path*`]
}
