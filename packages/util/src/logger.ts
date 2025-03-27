import c from "tinyrainbow"

import { LOG_LEVEL, LOG_TIMESTAMP, PRODUCTION } from "@karr/config"

const { blue, cyan, gray, green, magenta, red, underline, yellow } = c

/**
 * Get the file and line number of the calling function
 * @returns The file and line number of the calling function
 */
const getCallerFileAndLine = (): string | null => {
    if (PRODUCTION) return null
    const stack = new Error().stack
    if (stack) {
        const stackLines = stack.split("\n")
        // Skip the first two lines (Error message and this function)
        for (let i = 2; i < stackLines.length; i++) {
            const line = stackLines[i]
            if (line && !line.includes("logger.js")) {
                // Extract file, line, and column
                const regex = /\s+at\s+(?:.*\s+)?\(?(.+):(\d+):(\d+)\)?/
                const match = line.match(regex)
                if (match && match[1]) {
                    const filepath = match[1]
                    const file = filepath.split("/").pop()
                    const lineNumber = match[2]
                    const columnNumber = match[3]
                    return `${file}:${lineNumber}:${columnNumber}`
                }
            }
        }
    }
    return null
}

/**
 * Create the prefix for the log message
 * Can include the timestamp and the file and line number of the calling function
 * @returns The prefix for the log message
 */
const prefix = () => {
    const now = new Date().toLocaleString("en-GB", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    })
    const c = getCallerFileAndLine()
    const caller = c ? gray(`(${c}) `) : ""
    const timestamp = LOG_TIMESTAMP ? `[${now}] ` : ""
    return `${timestamp}${caller}`
}

const formatArg = (arg: unknown): string => {
    if (typeof arg === "object" && arg !== null) {
        return JSON.stringify(arg, null, 2) // Pretty-print objects
    }
    return String(arg) // Convert other types to string
}

/**
 * A simple logger that logs messages to the console.
 *
 * The logger has 5 levels: trace, debug, info, warn, and error.
 * The log level can be set using the LOG_LEVEL environment variable.
 *
 * The logger also logs timestamps, which can be disabled using the LOG_TIMESTAMP environment variable.
 * @example
 * ```ts
 * import { logger } from "@util"
 * logger.info("Hello, world!")
 * logger.error("Major error", error, 123)
 * ```
 */
export const logger = {
    /**
     * Log a message to the console, with no particular level.
     * Is only logged if the log level is set to trace, debug, or info.
     * @param args - The arguments to log
     * @example
     * Pass any number of arguments to log
     * ```ts
     * logger.log("Hello, world!", variable, 123)
     * ```
     */
    log: (...args: unknown[]) => {
        if (["trace", "debug", "info"].includes(LOG_LEVEL)) {
            console.log(cyan(`${prefix()}>`), ...args)
        }
    },
    /**
     * Log a success message to the console with the level.
     * Is logged at all log levels
     * @param args - The arguments to log
     * @example
     * Pass any number of arguments to log
     * ```ts
     * logger.success("Successfully created user", user)
     * ```
     */
    success: (title: unknown, ...args: unknown[]) => {
        if (["trace", "debug", "info", "warn", "error"].includes(LOG_LEVEL)) {
            console.log(green(`${prefix()}✅ ${underline("SUCCESS")} >`), title)
            args.forEach((arg) => {
                formatArg(arg)
                    .split("\n")
                    .forEach((line) => {
                        console.log("   ", line)
                    })
            })
        }
    },
    /**
     * Log a message to the console with the error level.
     * Is logged at all log levels
     * @param args - The arguments to log
     * @example
     * Pass any number of arguments to log
     * ```ts
     * logger.error("Major error", error, 123)
     * ```
     */
    error: (title: unknown, ...args: unknown[]) => {
        if (["trace", "debug", "info", "warn", "error"].includes(LOG_LEVEL)) {
            console.error(red(`${prefix()}⚠️ ${underline("ERROR")} >`), title)
            args.forEach((arg) => {
                formatArg(arg)
                    .split("\n")
                    .forEach((line) => {
                        console.error("   ", line)
                    })
            })
        }
    },
    /**
     * Log a message to the console with the warn level.
     * Is only logged if the log level is set to trace, debug, info, or warn
     * @param args - The arguments to log
     * @example
     * Pass any number of arguments to log
     * ```ts
     * logger.warn("Warning, this happened", unimportantError, 123)
     * ```
     */
    warn: (title: unknown, ...args: unknown[]) => {
        if (["trace", "debug", "info", "warn"].includes(LOG_LEVEL)) {
            console.warn(yellow(`${prefix()}⚠ ${underline("WARN")} >`), title)
            args.forEach((arg) => {
                formatArg(arg)
                    .split("\n")
                    .forEach((line) => {
                        console.warn("   ", line)
                    })
            })
        }
    },
    /**
     * Log a message to the console with the info level.
     * Is only logged if the log level is set to trace, debug, or info
     * @param args - The arguments to log
     * @example
     * Pass any number of arguments to log
     * ```ts
     * logger.info("FYI", variable, 123)
     * ```
     */
    info: (title: unknown, ...args: unknown[]) => {
        if (["trace", "debug", "info"].includes(LOG_LEVEL)) {
            console.info(blue(`${prefix()}ℹ ${underline("INFO")} >`), title)
            args.forEach((arg) => {
                formatArg(arg)
                    .split("\n")
                    .forEach((line) => {
                        console.info("   ", line)
                    })
            })
        }
    },
    /**
     * Log a message to the console with the debug level.
     * Is only logged if the log level is set to trace or debug
     * @param args - The arguments to log
     * @example
     * Pass any number of arguments to log
     * ```ts
     * logger.debug("This is what's happening", variable, 123)
     * ```
     */
    debug: (title: unknown, ...args: unknown[]) => {
        if (["trace", "debug"].includes(LOG_LEVEL)) {
            console.debug(magenta(`${prefix()}🐞 ${underline("DEBUG")} >`), title)
            args.forEach((arg) => {
                formatArg(arg)
                    .split("\n")
                    .forEach((line) => {
                        console.debug("   ", line)
                    })
            })
        }
    },
    /**
     * Log a message to the console with the trace level.
     * Is only logged if the log level is set to trace
     * @param args - The arguments to log
     * @example
     * Pass any number of arguments to log
     * ```ts
     * logger.trace("This is particularly bewildering", variable, 123)
     * ```
     */
    trace: (...args: unknown[]) => {
        if (["trace"].includes(LOG_LEVEL)) {
            console.trace(green(`${prefix()}>`), ...args)
        } else if (LOG_LEVEL === "debug") {
            console.trace(
                gray(
                    "[TRACE log level not enabled, remember to remove this trace call before production!]"
                )
            )
        }
    }
}

export default logger
