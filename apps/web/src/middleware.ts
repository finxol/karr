import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import createMiddleware from "next-intl/middleware"

import { routing } from "@/i18n/routing"

import { getFrontendApi } from "../../../packages/ory/src/sdk/server"

const i18nMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
    // i18n check
    const response = i18nMiddleware(request)
    const locale = request.nextUrl.pathname.split("/")[1]

    // Ory session check
    const api = await getFrontendApi()
    const session = await api
        .toSession({
            cookie: `ory_kratos_session=${request.cookies.get("ory_kratos_session")?.value}`
        })
        .then((response) => {
            return response.data
        })
        .catch((err) => {
            console.error("ERROR", err)
            return null
        })

    const authPaths = ["/trips", "/account"]
    const isAuthRequired = authPaths.some((path) =>
        request.nextUrl.pathname.includes(path)
    )

    if (isAuthRequired && !session) {
        console.log("NO SESSION", request.nextUrl.pathname)

        return NextResponse.redirect(
            new URL(
                `/${locale}/auth/login?return_to=${request.nextUrl.pathname}`,
                request.url
            )
        )
    }

    console.log("SESSION EXISTS", request.nextUrl.pathname)

    return response
}

export const config = {
    matcher: ["/trips/:path*", "/account", "/", `/(fr|en)/:path*`]
}
