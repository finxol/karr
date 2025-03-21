import { Hono } from "hono"
import { deleteCookie, getCookie, setCookie } from "hono/cookie"

import logger from "@karr/util/logger"

import { login, logout, register } from "@/lib/auth"
import { responseErrorObject } from "@/lib/helpers"

const hono = new Hono()

hono.post("/login", async (c) => {
    const body = await c.req.json()
    logger.debug("login", { body })

    const authToken = getCookie(c, "auth-token")

    if (!authToken) {
        const token = await login(body.email, body.password)

        if (token.isErr()) {
            logger.error("login failed", { error: token.error })
            return responseErrorObject(c, { message: "Invalid email or password" }, 401)
        }

        setCookie(c, "auth-token", token.value, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 60 * 60 * 24 // 1 day
        })
    }

    return c.json("ok")
})

hono.post("/signup", async (c) => {
    const body = await c.req.json()
    logger.debug("signup", { body })

    const token = await register(body.email, body.password)

    if (token.isErr()) {
        logger.error("signup failed", { error: token.error })
        return responseErrorObject(c, { message: "Invalid email or password" }, 401)
    }

    setCookie(c, "auth-token", token.value, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 // 1 day
    })

    return c.json("ok")
})

hono.get("/logout", async (c) => {
    // this means anyone can log someone else out, will be fixed with jwt
    const authToken = getCookie(c, "auth-token")
    deleteCookie(c, "auth-token")

    logout(authToken || "")
    return c.json("ok")
})

export default hono
