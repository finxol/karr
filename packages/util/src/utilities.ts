export { tryCatch } from "./trycatch"

/**
 * Convert a snake_case string to camelCase
 * @param str - A string in snake_case
 * @returns The string in camelCase
 */
export function toCamelCase(str: string): string {
    // If the string is already in camelCase, return it as is
    if (/^[a-z][a-zA-Z0-9]*$/.test(str)) {
        return str
    }

    // Handle space/underscore separated and PascalCase strings
    return str
        .replace(/^[A-Z]/, (c) => c.toLowerCase()) // Convert first char to lowercase
        .replace(/[_\s](\w)/g, (_, c) => c.toUpperCase()) // Handle spaces and underscores
}
