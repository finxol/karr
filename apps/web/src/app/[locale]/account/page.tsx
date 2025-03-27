"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import type { SettingsFlow, UpdateSettingsFlowBody } from "@ory/client"
import { LogOut } from "lucide-react"
import { useLocale } from "next-intl"

import { kratos } from "@karr/ory/sdk/client"
import { Button } from "@karr/ui/components/button"
import { toast } from "@karr/ui/components/sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@karr/ui/components/tabs"

import { useRouter } from "@/i18n/routing"
import { HandleError, LogoutLink } from "@/ory"

import AccountSessions from "../auth/_components/accountSessions"
import AccountSettings from "../auth/_components/accountSettings"

export default function Page({ params }: { params: { locale: string } }) {
    const locale = useLocale()
    const onLogout = LogoutLink({ locale })

    const [flow, setFlow] = useState<SettingsFlow>()

    const router = useRouter()
    const sp = useSearchParams()

    const returnTo = sp.get("return_to") ?? undefined
    const flowId = sp.get("flow") ?? undefined

    const getFlow = useCallback((flowId: string) => {
        return kratos
            .getSettingsFlow({ id: String(flowId) })
            .then(({ data }) => setFlow(data))
            .catch(handleError)
    }, [])

    const handleError = useCallback(
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error: any) => {
            const handle = HandleError(getFlow, setFlow, "/flow/settings", true, router)
            return handle(error)
        },
        [getFlow]
    )

    const createFlow = useCallback(
        (returnTo: string | undefined) => {
            kratos
                .createBrowserSettingsFlow({ returnTo })
                .then(({ data }) => {
                    setFlow(data)
                    addQueryParam("flow", data.id)
                })
                .catch(handleError)
        },
        [handleError]
    )

    const updateFlow = async (body: UpdateSettingsFlowBody) => {
        kratos
            .updateSettingsFlow({
                flow: String(flow?.id),
                updateSettingsFlowBody: body
            })
            .then(({ data }) => {
                // update flow object
                setFlow(data)

                // show toast for user feedback
                const message = data.ui.messages?.pop()
                if (message) {
                    toast.success(message.text)
                }

                // check if verification is needed
                if (data.continue_with) {
                    for (const item of data.continue_with) {
                        switch (item.action) {
                            case "show_verification_ui":
                                router.push("/verification?flow=" + item.flow.id)
                                return
                        }
                    }
                }

                // check if custom return page was specified
                if (data.return_to) {
                    window.location.href = data.return_to
                    return
                }
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

        createFlow(returnTo)
    }, [flowId, router, returnTo, createFlow, getFlow])

    const addQueryParam = useCallback(
        (name: string, value: string) => {
            const newParams = new URLSearchParams(params.toString())
            newParams.set(name, value)
            router.push("?" + newParams.toString())
        },
        [params]
    )

    return (
        <div className="flex flex-col min-h-screen items-center text-3xl relative space-y-4 mx-auto my-auto">
            <div className="absolute flex flex-row w-fit items-center space-x-4 top-4 right-4">
                <Button variant="outline" size="icon" onClick={onLogout}>
                    <LogOut className="h-[1.2rem] w-[1.2rem]" />
                </Button>
            </div>
            <Tabs
                defaultValue="account"
                value={sp.get("tab") ?? undefined}
                className="w-full max-w-md"
                onValueChange={(value) => addQueryParam("tab", value)}
            >
                <TabsList className="grid w-full grid-cols-2 mt-16">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="sessions">Sessions</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="mb-16">
                    <AccountSettings flow={flow} updateFlow={updateFlow} />
                </TabsContent>
                <TabsContent value="sessions" className="mb-16">
                    <AccountSessions />
                </TabsContent>
            </Tabs>
        </div>
    )
}
