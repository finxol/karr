import { FetchError, ofetch } from "ofetch"

import { FEDERATION_TARGETS } from "@karr/config"
import { TripSelect } from "@karr/db/schemas/trips.js"
import logger from "@karr/util/logger"

import { DataResponse } from "@/lib/types"

export async function getFederatedTrips() {
    const trips = []
    try {
        for await (const target of FEDERATION_TARGETS) {
            const t = await ofetch<DataResponse<TripSelect[]>>(
                "/api/v1/federation/trips/search",
                {
                    baseURL: target.url,
                    headers: {
                        Cookie: `auth-token=federation`
                    }
                }
            )
            for (const trip of t.data) {
                trip.origin = target.name
                trips.push(trip)
            }
        }
    } catch (error) {
        logger.error(
            "Error fetching trips from federation:",
            (error as FetchError)?.data || error
        )
    }
    return trips
}
