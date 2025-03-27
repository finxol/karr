import { cookies } from "next/headers"
import { usePathname } from "next/navigation"
import { getLocale } from "next-intl/server"

import { getFrontendApi } from "@karr/ory/sdk/server"

import { redirect } from "@/i18n/routing"

/**
 * Check if the user is authenticated.
 * Only works on the server side.
 */
export async function isAuthenticated() {
    const jar = await cookies()
    const kratos = await getFrontendApi()

    const session = await kratos
        .toSession({
            cookie: "ory_kratos_session=" + jar.get("ory_kratos_session")?.value
        })
        .then((data) => data.data)
        .catch(() => null)

    return !!session
}

export async function redirectIfUnAuthed() {
    const authed = await isAuthenticated()
    const locale = await getLocale()
    const return_to = usePathname()

    if (!authed) {
        redirect({
            href: {
                pathname: "/auth/login",
                query: { return_to }
            },
            locale
        })
    }
}
