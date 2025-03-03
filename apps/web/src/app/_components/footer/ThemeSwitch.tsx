"use client"

import { useEffect, useId, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Moon as IconMoon, Sun as IconSun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@karr/ui/components/button"

function ThemeSwitch() {
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    const moonId = useId()
    const sunId = useId()

    // Only show the theme toggle after mounting to avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    function toggleTheme() {
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    // Animation variants for the icons
    const iconVariants = {
        initial: { rotate: -90 },
        animate: { rotate: 0 },
        exit: { rotate: 90 }
    }

    return (
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <AnimatePresence mode="wait">
                {(!mounted || resolvedTheme === "light") && (
                    <motion.div
                        key={moonId}
                        variants={iconVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.1 }}
                    >
                        <IconMoon className="size-[1.2rem]" />
                    </motion.div>
                )}
                {resolvedTheme === "dark" && (
                    <motion.div
                        key={sunId}
                        variants={iconVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.1 }}
                    >
                        <IconSun className="size-[1.2rem]" />
                    </motion.div>
                )}
            </AnimatePresence>
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}

export { ThemeSwitch }
