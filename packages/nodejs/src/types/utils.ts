/**
 * A function with a spread of arguments, returning a generic type.
 */
export type Func<T = void> = (...args: any[]) => T
