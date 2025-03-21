import { eq } from "drizzle-orm"

import drizzle from "@karr/db"
import { accountsTable } from "@karr/db/schemas/accounts.js"
import { tryCatch } from "@karr/util"

/**
 * Change an account's email address
 * @param id The ID of the account to update. Assumes uuid v4 format.
 * @param email The new email address
 * @returns Whether the update was successful
 */
export async function updateEmail(id: string, email: string) {
    const success = await tryCatch(
        drizzle.update(accountsTable).set({ email }).where(eq(accountsTable.id, id))
    )

    if (success.error) {
        return false
    }

    return true
}

/**
 * Check if a user is verified
 * @param id The ID of the account to check. Assumes uuid v4 format.
 * @returns Whether the user is verified
 */
export async function isVerified(id: string) {
    const accounts = await tryCatch(
        drizzle
            .select({
                verified: accountsTable.verified
            })
            .from(accountsTable)
            .where(eq(accountsTable.user, id))
            .limit(1)
    )

    if (accounts.error) {
        return {
            verified: false
        }
    }

    return {
        verified: accounts.value[0]?.verified === true
    }
}
