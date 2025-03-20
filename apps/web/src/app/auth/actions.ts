"use server"

import { cookies as getCookies } from "next/headers"

import { callbackUrl, client } from "@karr/auth/client"
import { subjects } from "@karr/auth/subjects"

import { redirect } from "@/i18n/routing"

import { setTokens } from "./index"

export async function auth() {
    const cookies = await getCookies()
    const accessToken = cookies.get("access_token")
    const refreshToken = cookies.get("refresh_token")

    if (!accessToken) {
        return false
    }

    const verified = await client.verify(subjects, accessToken.value, {
        refresh: refreshToken?.value
    })

    if (verified.err) {
        return false
    }
    if (verified.tokens) {
        await setTokens(verified.tokens.access, verified.tokens.refresh)
    }

    return verified.subject
}

export async function login() {
    const cookies = await getCookies()
    const accessToken = cookies.get("access_token")
    const refreshToken = cookies.get("refresh_token")

    if (accessToken) {
        const verified = await client.verify(subjects, accessToken.value, {
            refresh: refreshToken?.value
        })
        if (!verified.err && verified.tokens) {
            await setTokens(verified.tokens.access, verified.tokens.refresh)
            redirect({ href: "/", locale: "fr" })
        }
    }

    const { url } = await client.authorize(callbackUrl, "code")
    redirect({ href: url, locale: "fr" })
}

export async function logout() {
    const cookies = await getCookies()
    cookies.delete("access_token")
    cookies.delete("refresh_token")

    redirect({ href: "/", locale: "fr" })
}
