import crypto from "node:crypto"
import { and, eq } from "drizzle-orm"
import { err, ok } from "neverthrow"

import db from "@karr/db"
import { accountsTable } from "@karr/db/schemas/accounts.js"
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

export async function isAuthenticated(userId: string, token: string) {
    const user = await tryCatch(
        db
            .select({
                id: accountsTable.id,
                email: accountsTable.email,
                blocked: accountsTable.blocked,
                verified: accountsTable.verified
            })
            .from(accountsTable)
            .where(and(eq(accountsTable.token, token), eq(accountsTable.id, userId)))
            .limit(1)
    )

    if (user.error) {
        return false
    }

    if (!user || user.value.length === 0 || user.value[0] === undefined) {
        return false
    }

    if (user.value[0].id !== userId) {
        return false
    }

    return true
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
