"use client"

import { ChangeEvent } from "react"

import { Input } from "@karr/ui/components/input"

interface CurrencyInputProps {
    currencySymbol?: string
    value: number
    onChange: (value: number) => void
    onBlur?: () => void // Add this
}

export function CurrencyInput({
    currencySymbol = "€",
    value,
    onChange,
    onBlur // Add this
}: CurrencyInputProps) {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value === "" ? 0 : parseFloat(event.target.value)
        onChange(newValue)
    }

    const displayValue = typeof value === "number" ? value.toFixed(2) : "0.00"

    return (
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-muted-foreground">{currencySymbol}</span>
            </div>
            <Input
                type="number"
                min={0}
                max={1000}
                step={1}
                placeholder="0.00"
                value={displayValue}
                onChange={handleChange}
                onBlur={onBlur} // Add this
                className="pl-8"
            />
        </div>
    )
}
