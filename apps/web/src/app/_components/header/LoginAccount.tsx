import { cookies as getCookies } from "next/headers"
import { User as IconUser } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { getFrontendApi } from "@karr/ory/sdk/server"
import { Button } from "@karr/ui/components/button"

import { Link } from "@/i18n/routing"

export default async function LoginAccount() {
    const t = await getTranslations("auth")

    const cookies = await getCookies()

    const kratos = await getFrontendApi()
    const session = await kratos
        .toSession({
            cookie: `ory_kratos_session=${cookies.get("ory_kratos_session")?.value}`
        })
        .catch(() => {
            console.log("No session")
            return null
        })

    return (
        <>
            {session ? (
                <Button asChild>
                    <Link href="/account">
                        <IconUser />
                        <span className="hidden sm:block">{t("Account.title")}</span>
                    </Link>
                </Button>
            ) : (
                <>
                    <Button asChild variant="secondary" className="hidden sm:block">
                        <Link href="/auth/signup">{t("SignUp.title")}</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/auth/login">{t("Login.title")}</Link>
                    </Button>
                </>
            )}
        </>
    )
}
