"use server"

import React from "react"
import { OAuth2ConsentRequest, OAuth2RedirectTo } from "@ory/client"

import { getOAuth2Api } from "@karr/ory/sdk/server"
import { Card } from "@karr/ui/components/card"
import { toast } from "@karr/ui/components/sonner"

import { redirect, routing } from "@/i18n/routing"

import ConsentForm from "../_components/consentForm"

export default async function Consent({
    params,
    searchParams
}: {
    params: { locale: string }
    searchParams: Promise<{ consent_challenge: string }>
}) {
    const locale = params.locale || routing.defaultLocale

    const sp = await searchParams
    const consentChallenge = sp.consent_challenge ?? undefined

    let consentRequest: OAuth2ConsentRequest | undefined = undefined

    const onAccept = async (challenge: string, scopes: string[], remember: boolean) => {
        "use server"

        const hydra = await getOAuth2Api()
        const response = await hydra
            .acceptOAuth2ConsentRequest({
                consentChallenge: challenge,
                acceptOAuth2ConsentRequest: {
                    grant_scope: scopes,
                    remember: remember,
                    remember_for: 3600
                }
            })
            .then(({ data }) => data)
            .catch((_) => {
                toast.error("Something unexpected went wrong.")
            })

        if (!response) {
            return redirect({ href: "/", locale })
        }

        return redirect({ href: response.redirect_to, locale })
    }

    const onReject = async (challenge: string) => {
        "use server"

        const hydra = await getOAuth2Api()
        const response: OAuth2RedirectTo | void = await hydra
            .rejectOAuth2ConsentRequest({
                consentChallenge: challenge
            })
            .then(({ data }) => data)
            .catch((_) => {
                toast.error("Something unexpected went wrong.")
            })

        if (!response) {
            return redirect({ href: "/", locale })
        }

        return redirect({ href: response.redirect_to, locale })
    }

    if (!consentChallenge) {
        return
    }

    const hydra = await getOAuth2Api()
    await hydra.getOAuth2ConsentRequest({ consentChallenge }).then(({ data }) => {
        if (data.skip) {
            onAccept(consentChallenge, data.requested_scope!, false)
            return
        }
        consentRequest = data
    })

    if (!consentRequest) {
        return
    }

    return (
        <Card className="flex flex-col items-center w-full max-w-sm p-4">
            <ConsentForm
                request={consentRequest}
                onAccept={onAccept}
                onReject={onReject}
            />
        </Card>
    )
}
