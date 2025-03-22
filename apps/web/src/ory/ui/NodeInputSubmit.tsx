"use client"

import { getNodeLabel } from "@ory/integrations/ui"

import { Button } from "@karr/ui/components/button"

import { NodeInputProps } from "./helpers"

export function NodeInputSubmit({ node, attributes, disabled }: NodeInputProps) {
    return (
        <Button
            name={attributes.name}
            value={attributes.value || ""}
            disabled={attributes.disabled || disabled}
        >
            {getNodeLabel(node)}
        </Button>
    )
}
