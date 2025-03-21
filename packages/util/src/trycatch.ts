// Types for the result object with discriminated union
type Success<T> = {
    value: T
    error: null
}

type Failure<E> = {
    value: null
    error: E
}

type Result<T, E = Error> = Success<T> | Failure<E>

/**
 * Wraps a promise in a try/catch block and returns a Result object
 * @param promise The promise to wrap
 * @returns A Result object
 */
export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
    try {
        const value = await promise
        return { value, error: null }
    } catch (error) {
        return { value: null, error: error as E }
    }
}
