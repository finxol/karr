"use client"

import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Earth as IconEarth, House as IconHouse, Trash as IconTrash } from "lucide-react"

import { TripSelectSchema, type TripSelect } from "@karr/db/schemas/trips.js"
import { Badge } from "@karr/ui/components/badge"
import { Button } from "@karr/ui/components/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@karr/ui/components/card"
import { toast } from "@karr/ui/components/sonner"

import { apiFetch } from "@/util/apifetch"
import Loading from "@/components/Loading"
import { QueryProvider } from "@/components/QueryProvider"

export default function TripList({ userid }: { userid: string }) {
    return (
        <QueryProvider>
            <FetchTrips userid={userid} />
        </QueryProvider>
    )
}

function FetchTrips({ userid }: { userid: string }) {
    // Access the client
    const queryClient = useQueryClient()
    const [trips, setTrips] = useState<TripSelect[]>([])
    const [loading, setLoading] = useState(false)

    async function deleteTrip(tripId: string): Promise<undefined> {
        try {
            await apiFetch(`/trips/${tripId}`, {
                method: "DELETE",
                headers: {
                    authorization: tripId
                }
            })
            toast.success("Successfully deleted trip")
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ["trips"] })
            // Clear local trips state
            setTrips([])
        } catch (e) {
            console.error(e)
            toast.error("Failed to delete trip")
        }
    }

    const {
        data: stream,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ["trips"],
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        queryFn: async () =>
            apiFetch("/trips/search", {
                responseType: "stream"
            })
    })

    useEffect(() => {
        if (!stream) return

        const reader = stream.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        let mounted = true // Add mounted flag

        async function processStream() {
            try {
                setLoading(true)
                while (mounted) {
                    // Check if still mounted
                    const { done, value } = await reader.read()
                    if (done) {
                        setLoading(false)
                        break
                    }

                    buffer += decoder.decode(value, { stream: true })

                    // Split by newlines and process complete JSON objects
                    const lines = buffer.split("\n")
                    buffer = lines.pop() || "" // Keep the last incomplete line in buffer

                    const newTrips = lines
                        .filter((line) => line.startsWith("data: "))
                        .map((line) => {
                            line = line.trim()
                            try {
                                line = line.substring(6)
                                const tripData = JSON.parse(line)
                                return TripSelectSchema.parse(tripData)
                            } catch (e) {
                                console.error("Failed to parse trip:", e)
                                return null
                            }
                        })
                        .filter((trip): trip is TripSelect => trip !== null)

                    if (newTrips.length > 0 && mounted) {
                        // Check if still mounted
                        setTrips((prev) => [...prev, ...newTrips])
                    }
                }

                // Process any remaining data
                if (buffer.trim() && mounted) {
                    try {
                        const tripData = JSON.parse(buffer)
                        const trip = TripSelectSchema.parse(tripData)
                        setTrips((prev) => [...prev, trip])
                    } catch (e) {
                        console.error("Failed to parse final trip:", e)
                    }
                }
            } catch (e) {
                if (mounted) {
                    // Only log if still mounted
                    console.error("Stream reading error:", e)
                }
            }
        }

        processStream()

        return () => {
            mounted = false // Set mounted to false on cleanup
            // Ensure we properly clean up the reader
            try {
                reader.cancel()
            } catch (e) {
                console.error("Error cleaning up reader:", e)
            } finally {
                reader.releaseLock()
                // Clear local trips state
                setTrips([])
            }
        }
    }, [stream])

    useEffect(() => {
        // Clear trips when component mounts or userid changes
        setTrips([])
    }, [userid])

    if (isLoading) {
        return <Loading />
    }

    if (isError || !stream) {
        return <div>Error: {error?.message}</div>
    }

    return (
        <section className="flex flex-col items-center justify-start gap-4">
            {trips.map((trip) => {
                const t = TripSelectSchema.parse(trip)
                return (
                    <TripCard
                        key={`${trip.origin || ""}@${t.id}`}
                        trip={t}
                        onDelete={deleteTrip}
                    />
                )
            })}
            {loading && <Loading />}
        </section>
    )
}

function TripCard({
    trip,
    onDelete
}: {
    trip: TripSelect
    onDelete: (id: string) => Promise<void>
}) {
    return (
        <Card className="max-w-full w-lg">
            <CardHeader>
                <CardTitle>
                    <div className="flex flex-row justify-between items-center gap-2">
                        <p>
                            {trip.from} – {trip.to}
                        </p>
                        {!trip.origin && (
                            <Button variant="outline" onClick={() => onDelete(trip.id)}>
                                <IconTrash />
                            </Button>
                        )}
                    </div>
                </CardTitle>
                <CardDescription>
                    {new Date(trip.departure).toLocaleDateString()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>{trip.price} €</p>
            </CardContent>
            <CardFooter className="flow-inline">
                {trip.origin ? (
                    <Badge
                        variant="outline"
                        className="text-sm flex flex-row items-center gap-1"
                    >
                        <IconEarth />
                        {trip.origin}
                    </Badge>
                ) : (
                    <Badge
                        variant="outline"
                        className="text-sm flex flex-row items-center gap-1"
                    >
                        <IconHouse className="my-0.5" />
                    </Badge>
                )}
                <p>{trip.email?.split("@")[0] || trip.account.split("-")[0]}</p>
            </CardFooter>
        </Card>
    )
}
