import { cookies } from "next/headers"
import { ofetch } from "ofetch"

import { getFrontendApi } from "@karr/ory/sdk/server"

const kratosFetcher = ofetch.create({
    baseURL: process.env.NEXT_PUBLIC_ORY_KRATOS_URL,
    retry: 1,
    credentials: "include",
    async onRequest(ctx) {
        console.log("REQUEST", ctx)
    },
    async onResponseError(ctx) {
        console.log("ERROR", ctx.error)
        console.log("ERROR RESPONSE", ctx.response)
    }
})

async function _toSession() {
    const jar = await cookies()
    const cookie = jar.get("ory_kratos_session")

    return kratosFetcher("/sessions/whoami", {
        headers: {
            Cookie: cookie ? `ory_kratos_session=${cookie.value}` : ""
        }
    }).catch((err) => {
        console.error("CAUGHT ERROR", err)
        return "ERROR"
    })
}

export default async function Account() {
    const jar = await cookies()
    const kratos = await getFrontendApi()

    const session = await kratos
        .toSession({
            cookie: "ory_kratos_session=" + jar.get("ory_kratos_session")?.value
        })
        .then((data) => data.data)
    console.log("Session data:", session)

    if (!session) {
        return (
            <div>
                <h1>Account</h1>
                <p>You are not logged in.</p>
            </div>
        )
    }

    return (
        <div>
            <h1>Account</h1>

            <h2>Devices</h2>
            <p>Manage your devices and sessions.</p>

            {session.devices?.map((device) => (
                <div key={device.id}>
                    <h3>{device.id}</h3>
                    <p>{device.user_agent}</p>
                </div>
            ))}

            <details>
                <summary>Session data:</summary>
                <pre className="font-mono">{JSON.stringify(session, null, 2)}</pre>
            </details>
        </div>
    )
}
