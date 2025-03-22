"use client"

import React, { memo, useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { LoginFlow, UpdateLoginFlowBody } from "@ory/client"

import { APPLICATION_NAME } from "@karr/config/static"
import { kratos } from "@karr/ory/sdk/client"
import { Button } from "@karr/ui/components/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@karr/ui/components/card"
import { Skeleton } from "@karr/ui/components/skeleton"

import { Link, useRouter } from "@/i18n/routing"
import { Flow, HandleError, LogoutLink } from "@/ory"

const MemoizedAppName = memo(
    () => <span>{APPLICATION_NAME}</span>,
    () => true // Never update
)

export default function Login() {
    const [flow, setFlow] = useState<LoginFlow>()

    const router = useRouter()
    const params = useSearchParams()

    const flowId = params.get("flow") ?? undefined
    const aal = params.get("aal") ?? undefined
    const refresh = params.get("refresh") ? true : undefined
    const returnTo = params.get("return_to") ?? undefined
    const loginChallenge = params.get("login_challenge") ?? undefined

    const onLogout = LogoutLink([aal, refresh])

    const getFlow = useCallback((flowId: string) => {
        return kratos
            .getLoginFlow({ id: String(flowId) })
            .then(({ data }) => setFlow(data))
            .catch(handleError)
    }, [])

    const handleError = useCallback(
        (error: Error) => {
            const handle = HandleError(getFlow, setFlow, "/auth/login", true, router)
            return handle(error)
        },
        [getFlow, router]
    )

    const createFlow = useCallback(
        (
            aal: string | undefined,
            refresh: boolean | undefined,
            returnTo: string | undefined,
            loginChallenge: string | undefined
        ) => {
            kratos
                .createBrowserLoginFlow({ aal, refresh, returnTo, loginChallenge })
                .then(({ data }) => {
                    setFlow(data)
                    router.push(`?flow=${data.id}`)
                })
                .catch(handleError)
        },
        [handleError, router]
    )

    const updateFlow = async (body: UpdateLoginFlowBody) => {
        kratos
            .updateLoginFlow({
                flow: String(flow?.id),
                updateLoginFlowBody: body
            })
            .then(() => {
                if (flow?.return_to) {
                    window.location.href = flow?.return_to
                    return
                }
                router.push("/")
            })
            .catch(handleError)
    }

    useEffect(() => {
        if (flow) {
            return
        }

        if (flowId) {
            getFlow(flowId).then()
            return
        }

        createFlow(aal, refresh, returnTo, loginChallenge)
    }, [
        flowId,
        router,
        aal,
        refresh,
        returnTo,
        createFlow,
        loginChallenge,
        getFlow,
        flow
    ])

    return (
        <Card className="flex flex-col items-center w-full max-w-sm p-4">
            <CardHeader className="flex flex-col items-center text-center space-y-4">
                {flow ? (
                    <div className="flex flex-col space-y-4">
                        <CardTitle>
                            {(() => {
                                if (flow?.refresh) {
                                    return "Confirm Action"
                                } else if (flow?.requested_aal === "aal2") {
                                    return "Two-Factor Authentication"
                                }
                                return "Welcome"
                            })()}
                        </CardTitle>
                        <CardDescription className="max-w-xs">
                            Log in to <MemoizedAppName />
                        </CardDescription>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-6">
                        <Skeleton className="h-6 w-full rounded-md" />
                        <div className="flex flex-col space-y-2">
                            <Skeleton className="h-3 w-full rounded-md" />
                            <Skeleton className="h-3 w-[250px] rounded-md" />
                        </div>
                    </div>
                )}
            </CardHeader>
            <CardContent className="w-full">
                {flow ? (
                    <Flow flow={flow} onSubmit={updateFlow} />
                ) : (
                    <div className="flex flex-col space-y-4 mt-4">
                        <div className="flex flex-col space-y-2">
                            <Skeleton className="h-3 w-[80px] rounded-md" />
                            <Skeleton className="h-8 w-full rounded-md" />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Skeleton className="h-3 w-[80px] rounded-md" />
                            <Skeleton className="h-8 w-full rounded-md" />
                        </div>
                        <Button disabled>
                            <Skeleton className="h-4 w-[80px] rounded-md" />
                        </Button>
                    </div>
                )}
            </CardContent>

            {flow?.requested_aal === "aal2" ||
            flow?.requested_aal === "aal3" ||
            flow?.refresh ? (
                <Button onClick={onLogout} variant="link">
                    Log out
                </Button>
            ) : (
                <div className="flex flex-col">
                    {flow ? (
                        <Button variant="link" asChild>
                            <Link
                                href={{
                                    pathname: "/auth/recovery",
                                    query: { return_to: flow.return_to }
                                }}
                                className="text-orange-600"
                                passHref
                            >
                                Forgot your password?
                            </Link>
                        </Button>
                    ) : (
                        <Skeleton className="h-3 w-[180px] rounded-md my-3.5" />
                    )}
                    {flow ? (
                        <Button variant="link" asChild disabled={!flow}>
                            <Link
                                href={{
                                    pathname: "/auth/registration",
                                    query: { return_to: flow.return_to }
                                }}
                                className="inline-flex space-x-2"
                                passHref
                            >
                                Create an account
                            </Link>
                        </Button>
                    ) : (
                        <Skeleton className="h-3 w-[180px] rounded-md my-3.5" />
                    )}
                </div>
            )}
        </Card>
    )
}
