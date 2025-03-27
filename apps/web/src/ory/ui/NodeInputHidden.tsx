"use client"

import { NodeInputProps, useOnload } from "./helpers"

export function NodeInputHidden({ attributes }: NodeInputProps) {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    useOnload(attributes as any)

    return (
        <input
            type={attributes.type}
            name={attributes.name}
            value={attributes.value || "true"}
        />
    )
}
