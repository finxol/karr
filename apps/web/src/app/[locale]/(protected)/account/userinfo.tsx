"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { CheckIcon, OctagonXIcon } from "lucide-react"

import { Badge } from "@karr/ui/components/badge"
import { client, InferResponseType } from "@karr/api/client"
import Loading from "@/components/Loading"

export default function FetchUserData() {
    const { data, isError, isLoading, error } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const res = await client.user.info.$get()
            if (res.status !== 200) {
                throw new Error("Failed to fetch user data", {
                    cause: await res.json()
                })
            }
            return res.json()
        }
    })

    if (isLoading) {
        return <Loading />
    }

    if (isError || !data) {
        console.error("Error loading user data", error)
        return <p>Error loading user data</p>
    }

    return <ShowUserData user={data} />
}

// TODO: add user type
function ShowUserData({
    user
}: { user: InferResponseType<typeof client.user.info.$get, 200> }) {
    const t = useTranslations("auth.Account")

    console.log("user", user)
    console.log("user.verified", user.verified)

    const hasSpecialStatus = false

    return (
        <div>
            <section className="flow">
                <aside className="flex flex-row gap-4">
                    {user.verified ? (
                        <Badge variant="default">
                            <CheckIcon aria-hidden="true" />
                            {t("verified")}
                        </Badge>
                    ) : (
                        <Badge variant="destructive">
                            <OctagonXIcon aria-hidden="true" />
                            {t("not-verified")}
                        </Badge>
                    )}

                    {!hasSpecialStatus && (
                        <Badge variant="outline">
                            <p>{user?.bio || t("no-special-status")}</p>
                        </Badge>
                    )}
                </aside>
                <div className="flex flex-row gap-6">
                    <b>{t("user-id")}</b>
                    <p>{user.id.split("-")[0]}</p>
                </div>
                <div className="flex flex-row gap-6">
                    <b>{t("email")}</b>
                    <p>{user.email}</p>
                </div>
            </section>
            <details className="mt-12 text-sm">
                <summary className="text-gray-300 dark:text-gray-700">
                    See raw
                </summary>
                <pre>{JSON.stringify(user, null, 2)}</pre>
            </details>
        </div>
    )
}
