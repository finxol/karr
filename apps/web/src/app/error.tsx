"use client"

// Error components must be client components
import { Link } from "@/i18n/routing"

export default function Error({ error }: { error: Error & { digest?: string } }) {
    console.error(error)

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                fontFamily: "sans-serif"
            }}
        >
            <h1>An unexpected error occurred!</h1>
            <p>Something went wrong. Please try again.</p>
            <Link
                href="/"
                style={{
                    padding: "10px 20px",
                    backgroundColor: "#0070f3",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "5px",
                    marginTop: "20px"
                }}
            >
                Go back to home
            </Link>
        </div>
    )
}
