"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { Badge } from "@karr/ui/components/badge"

import { QueryProvider } from "@/components/QueryProvider"
import { apiFetch } from "@/util/apifetch"

export default function UserInfo({ userid }: { userid: string }) {
    return (
        <QueryProvider>
            <FetchUserData userid={userid} />
        </QueryProvider>
    )
}

function FetchUserData({ userid }: { userid: string }) {
    // Access the client
    const _queryClient = useQueryClient()

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["user", userid],
        retry: false,
        queryFn: async () =>
            apiFetch("/user", {
                headers: {
                    authorization: userid
                }
            })
    })

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (isError) {
        return <div>Error: {error.message}</div>
    }

    return <ShowUserData data={data} />
}

// TODO: add user type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ShowUserData({ data: { data: user } }: { data: any }) {
    const hasSpecialStatus = user.SpecialStatus?.id || false

    console.log(user)

    return (
        <div>
            <section className="flow">
                <aside className="flex flex-row gap-4">
                    {user.blocked ? (
                        <Badge variant="destructive">
                            <p>⚠️ Account blocked</p>
                        </Badge>
                    ) : user.verified ? (
                        <Badge variant="default">
                            <p>✔︎ Account verified</p>
                        </Badge>
                    ) : (
                        <Badge variant="destructive">
                            <p>❌ Account not verified</p>
                        </Badge>
                    )}

                    {!hasSpecialStatus && (
                        <Badge variant="destructive">
                            <p>{user.SpecialStatus?.name || "No special status"}</p>
                        </Badge>
                    )}
                </aside>
                <div className="flex flex-row gap-6">
                    <b>User ID</b>
                    <p>{user.id}</p>
                </div>
                <div className="flex flex-row gap-6">
                    <b>Email</b>
                    <p>{user.email}</p>
                </div>
            </section>
            <details className="mt-12">
                <summary className="text-gray-300 dark:text-gray-700">See raw</summary>
                <pre>{JSON.stringify(user, null, 2)}</pre>
            </details>
        </div>
    )
}
