"use client"

import React, { useState } from "react"
import { Session, SessionDevice } from "@ory/client"
import { UAParser } from "ua-parser-js"

import { Badge } from "@karr/ui/components/badge"
import { Button } from "@karr/ui/components/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@karr/ui/components/card"

interface SessionItemProps {
    session: Session
    showInvalidate: boolean
    invalidateSession: (id: string) => void
}

export default function SessionItem({
    session,
    showInvalidate,
    invalidateSession
}: SessionItemProps) {
    const [device, setDevice] = useState<SessionDevice>(
        undefined as unknown as SessionDevice
    )

    if (!session.devices || session.devices.length < 1 || !session.devices[0]) {
        return
    }

    setDevice(session.devices[0])

    const parser = new UAParser(device.user_agent)
    const ua = parser.getResult()

    return (
        <Card className="relative w-full">
            <CardHeader>
                <CardTitle>{ua.os.name}</CardTitle>
                <CardDescription>
                    {ua.browser.name}, version {ua.browser.version} <br />
                    Signed in since {new Date(session.authenticated_at!).toLocaleString()}
                </CardDescription>
            </CardHeader>
            {showInvalidate ? (
                <Button
                    className="absolute top-4 right-4"
                    onClick={() => invalidateSession(session.id)}
                >
                    Invalidate
                </Button>
            ) : (
                <Badge className="absolute top-4 right-4">This session</Badge>
            )}
        </Card>
    )
}
