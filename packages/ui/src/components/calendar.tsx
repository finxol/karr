"use client"

import { buttonVariants } from "@karr/ui/components/button"
import { cn } from "@karr/ui/lib/utils"
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon
} from "lucide-react"
import type * as React from "react"
import { DayFlag, DayPicker, SelectionState, UI } from "react-day-picker"
import { fr } from "react-day-picker/locale"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export const Calendar = ({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) => {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                [UI.Months]: "relative",
                [UI.Month]: "space-y-4 ml-0",
                [UI.MonthCaption]: "flex justify-center items-center h-7",
                [UI.CaptionLabel]: "text-sm font-medium",
                [UI.PreviousMonthButton]: cn(
                    buttonVariants({ variant: "outline" }),
                    "absolute top-0 left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                [UI.NextMonthButton]: cn(
                    buttonVariants({ variant: "outline" }),
                    "absolute top-0 right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                [UI.MonthGrid]: "w-full border-collapse space-y-1",
                [UI.Weekdays]: "flex",
                [UI.Weekday]:
                    "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                [UI.Week]: "flex w-full mt-2",
                [UI.Day]:
                    "h-9 w-9 text-center rounded-md text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                [UI.DayButton]: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-normal hover:bg-primary hover:text-primary-foreground aria-selected:opacity-100"
                ),
                [SelectionState.range_end]: "day-range-end",
                [SelectionState.selected]:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                [SelectionState.range_middle]:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                [DayFlag.today]: "bg-accent text-accent-foreground",
                [DayFlag.outside]:
                    "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                [DayFlag.disabled]: "text-muted-foreground opacity-50",
                [DayFlag.hidden]: "invisible",
                ...classNames
            }}
            components={{
                Chevron: ({ className, orientation = "left", ...props }) => (
                    <Chevron
                        className={className}
                        orientation={orientation}
                        {...props}
                    />
                )
            }}
            locale={fr}
            {...props}
        />
    )
}

type Direction = "left" | "right" | "up" | "down"

const Chevron = ({
    className,
    orientation = "left"
}: {
    className: string | undefined
    orientation: Direction
}) => {
    switch (orientation) {
        case "left":
            return <ChevronLeftIcon className={cn("h-4 w-4", className)} />
        case "right":
            return <ChevronRightIcon className={cn("h-4 w-4", className)} />
        case "up":
            return <ChevronUpIcon className={cn("h-4 w-4", className)} />
        case "down":
            return <ChevronDownIcon className={cn("h-4 w-4", className)} />
        default:
            return null
    }
}
