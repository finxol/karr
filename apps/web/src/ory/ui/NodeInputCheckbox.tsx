"use client"

import { Checkbox } from "@karr/ui/components/checkbox"

import { NodeInputProps } from "./helpers"

export function NodeInputCheckbox({
    node,
    attributes,
    setValue,
    disabled
}: NodeInputProps) {
    const state = node.messages.find(({ type }) => type === "error") ? "error" : undefined

    // Render a checkbox.
    return (
        <div
            className={`inline-flex space-x-2 items-center ${state ? "text-yellow-500" : undefined}`}
        >
            <Checkbox
                id={attributes.name}
                name={attributes.name}
                defaultChecked={attributes.value}
                onCheckedChange={(e) => setValue(e)}
                disabled={attributes.disabled || disabled}
                className={`my-2 ${state ? "border-yellow-500" : undefined}`}
            />
            <label
                htmlFor={attributes.name}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                dangerouslySetInnerHTML={{ __html: node.meta.label?.text || "" }}
            />
        </div>
    )
}
