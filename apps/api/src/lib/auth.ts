import crypto from "node:crypto"
import { eq } from "drizzle-orm"
import { Context } from "hono"
import { getCookie } from "hono/cookie"
import { err, ok } from "neverthrow"

import db from "@karr/db"
import { accountsTable } from "@karr/db/schemas/accounts.js"
import { getFrontendApi } from "@karr/ory/sdk/server"
import { tryCatch } from "@karr/util"
import logger from "@karr/util/logger"

export async function authenticate(email: string, password: string) {
    const user = await tryCatch(
        db
            .select({
                id: accountsTable.id,
                email: accountsTable.email,
                password: accountsTable.password,
                blocked: accountsTable.blocked,
                verified: accountsTable.verified
            })
            .from(accountsTable)
            .where(eq(accountsTable.email, email))
            .limit(1)
    )

    if (user.error || user.value.length === 0 || user.value[0] === undefined) {
        return err("Invalid email or password")
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex")

    if (hashedPassword !== user.value[0].password) {
        return err("Invalid email or password")
    }

    if (user.value[0].blocked) {
        return err("Account is blocked")
    }

    return ok(user.value[0])
}

export async function login(email: string, password: string) {
    const user = await authenticate(email, password)

    if (user.isErr()) {
        return err("Invalid email or password")
    }

    // generate a new token
    const token = crypto.randomUUID()

    const saved = await tryCatch(
        db
            .update(accountsTable)
            .set({ token })
            .where(eq(accountsTable.id, user.value.id))
            .returning({ token: accountsTable.token })
    )

    if (saved.error || saved.value.length === 0 || saved.value[0] === undefined) {
        logger.error(`Failed to save token: ${token}`)
        return err("An error occurred while saving the token")
    }

    return ok(token)
}

export async function register(email: string, password: string) {
    const user = await tryCatch(
        db
            .insert(accountsTable)
            .values({
                email,
                password: crypto.createHash("sha256").update(password).digest("hex"),
                blocked: false,
                verified: true
            })
            .returning({ insertedId: accountsTable.id })
    )

    if (user.error || user.value.length === 0 || user.value[0] === undefined) {
        return err("An error occurred while creating the user")
    }

    // generate a new token
    const token = crypto.randomUUID()

    db.update(accountsTable)
        .set({ token })
        .where(eq(accountsTable.id, user.value[0].insertedId))

    return ok(token)
}

/**
 * Check if the user is authenticated
 * @param ctx The request context
 * @returns true if the user is authenticated
 */
export async function isAuthenticated(ctx: Context) {
    const cookie = getCookie(ctx, "ory_kratos_session")

    const kratos = await getFrontendApi()
    const session = await kratos
        .toSession({ cookie: "ory_kratos_session=" + cookie })
        .then(({ data }) => data)
        .catch((err) => {
            logger.error("Failed to get session", err)
            return null
        })

    return !!session?.active
}

export async function logout(token: string) {
    db.update(accountsTable).set({ token: "" }).where(eq(accountsTable.token, token))
}

/**
 * Get the account ID for a given token
 * @param token The user's token
 * @returns the account ID
 */
export async function getAccount(token: string) {
    const account = await tryCatch(
        db
            .select({
                id: accountsTable.id
            })
            .from(accountsTable)
            .where(eq(accountsTable.token, token))
            .limit(1)
    )

    if (account.error || account.value.length === 0 || account.value[0] === undefined) {
        return err("Invalid authorization token")
    }

    return ok(account.value[0].id)
}
