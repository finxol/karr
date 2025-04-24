/**
 * Utility type that expands complex types (like intersections or mapped types)
 * into a simpler, more readable structure in tooltips and error messages.
 *
 * It helps improve developer experience by showing the final computed shape
 * of a type, making it easier to understand and debug. It doesn't change
 * the actual structure of the type, only how TypeScript displays it.
 *
 * @template T The type to prettify.
 *
 * @example
 * type A = { a: string };
 * type B = { b: number };
 * type C = A & B;
 *
 * // Without Prettify, hovering over 'myVar' might show 'C' or 'A & B'
 * declare const myVar: C;
 *
 * // With Prettify, hovering over 'myPrettyVar' will show '{ a: string; b: number }'
 * declare const myPrettyVar: Prettify<C>;
 */
export type Prettify<T> = {
    [K in keyof T]: T[K]
} & {}

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

/**
 * Convert a string or number to an integer
 * @param value - The value to convert
 * @returns The integer value or undefined if the value is not a number
 * @throws If the value is not a number
 */
export function toInt(value: number | string): number {
    if (typeof value === "number") {
        return value
    }
    const parsed = parseInt(value, 10)
    if (isNaN(parsed)) {
        throw new Error(
            `${value} is not a number \n \t\t\tHINT: likely an invalid environment variable`
        )
    }
    return parsed
}

/**
 * Creates a lazy-initialized and memoized value.
 *
 * This function takes a `getter` function which is responsible for producing the value.
 * It returns an object with a `value` property. The `getter` function is only
 * executed the *first time* the `value` property is accessed. Subsequent accesses
 * will return the cached result without re-executing the `getter`.
 *
 * This is useful for delaying expensive computations or initializations until
 * they are actually needed.
 *
 * @template T The type of the value to be lazily computed.
 * @param getter — A function `() => T` that computes and returns the value.
 *               This function will be called at most once.
 * @returns An object with a `value` property of type T. Accessing this property
 *          triggers the computation (if not already done) and returns the value.
 *
 * @example
 * let computationCount = 0;
 * const expensiveValue = lazy(() => {
 *   console.log("Performing expensive computation...");
 *   computationCount++;
 *   return { data: "some complex data" };
 * });
 *
 * console.log("Accessing value first time:");
 * const val1 = expensiveValue.value; // Logs "Performing expensive computation..."
 * console.log(val1);                 // Logs { data: "some complex data" }
 * console.log("Computation count:", computationCount); // Logs 1
 *
 * console.log("Accessing value second time:");
 * const val2 = expensiveValue.value; // Does *not* log anything
 * console.log(val2);                 // Logs { data: "some complex data" }
 * console.log("Computation count:", computationCount); // Still logs 1
 */
export function lazy<T>(getter: () => T): { value: T } {
    return {
        get value() {
            const value = getter()
            Object.defineProperty(this, "value", { value })
            return value
        }
    }
}
