import { joinKey, splitKey, StorageAdapter } from "@openauthjs/openauth/storage/storage"
import { createStorage, type Driver } from "unstorage"
import memoryDriver from "unstorage/drivers/memory"

export function UnStorage({ driver }: { driver?: Driver } = {}): StorageAdapter {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    type Entry = [string, { value: Record<string, any>; expiry?: number }]

    const store = createStorage<Entry>({
        driver: driver ?? memoryDriver()
    })

    return {
        async get(key: string[]) {
            const k = joinKey(key)
            const entry = await store.get(k)
            const v = entry ? entry[1] : undefined

            if (v === undefined) {
                return undefined
            }

            if (v.expiry && Date.now() >= v.expiry) {
                await store.remove(k)
                return undefined
            }

            return v.value
        },

        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        async set(key: string[], value: any, expiry?: Date) {
            const k = joinKey(key)

            // Handle both Date objects and TTL numbers while maintaining Date type in signature
            const v: Entry = [
                k,
                {
                    value,
                    expiry: expiry ? expiry.getTime() : expiry
                }
            ]

            await store.setItem(k, v)
        },

        async remove(key: string[]) {
            const k = joinKey(key)
            await store.removeItem(k, { removeMeta: true })
        },

        async *scan(prefix: string[]) {
            const now = Date.now()
            const prefixStr = joinKey(prefix)

            // Get all keys matching our prefix
            const keys = await store.getKeys(prefixStr)

            for (const key of keys) {
                // Get the entry for this key
                const entry = await store.getItem(key)

                if (!entry) continue
                if (entry[1].expiry && now >= entry[1].expiry) continue

                yield [splitKey(key), entry[1].value]
            }
        }
    }
}
