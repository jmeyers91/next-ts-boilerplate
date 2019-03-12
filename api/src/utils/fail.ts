/**
 * Throws an error with an optional status code.
 *
 * @param message - The error message.
 * @param status - The HTTP status code to use during responses. Defaults to 400.
 * @returns Never
 */
export default function fail(message: string, status: number = 400): never {
  throw Object.assign(new Error(message), { status });
}
