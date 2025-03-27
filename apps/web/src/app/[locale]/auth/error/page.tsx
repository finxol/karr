"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { FlowError } from "@ory/client"

import { kratos } from "@karr/ory/sdk/client"
import { Button } from "@karr/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@karr/ui/components/card"

import { Link, useRouter } from "@/i18n/routing"

export default function Error() {
    const [error, setError] = useState<FlowError>()

    const router = useRouter()
    const params = useSearchParams()

    const id = params.get("id")

    useEffect(() => {
        if (error) {
            return
        }

        kratos
            .getFlowError({ id: String(id) })
            .then(({ data }) => {
                setError(data)
            })
            //eslint-disable-next-line @typescript-eslint/no-explicit-any
            .catch((err: any) => {
                switch (err.response?.status) {
                    case 404:
                    case 403:
                    case 410:
                        // The error id expired. Let's just redirect home!
                        return router.push("/")
                }

                return Promise.reject(err)
            })
    }, [id, router, error])

    if (!error) {
        return null
    }

    return (
        <>
            <Card className="mx-4 md:mx-8 max-w-5xl">
                <CardHeader>
                    <CardTitle>An error occurred</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{JSON.stringify(error, null, 2)}</p>
                </CardContent>
            </Card>
            <Button asChild>
                <Link href="/" className="inline-flex space-x-2" passHref>
                    Go back
                </Link>
            </Button>
        </>
    )
}
