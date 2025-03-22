import React from "react"

export default function FlowLayout({
    children
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex flex-col items-center justify-center relative space-y-4 mx-auto my-auto">
            {children}
        </div>
    )
}
