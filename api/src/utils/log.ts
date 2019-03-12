/**
 * Log functions that won't cause tslint errors.
 * Use these for logs that should exists in production.
 * Use `console.log` for debugging (tslint will ensure we remove them before committing).
 */

export default /* tslint:disable */ console.log.bind(
  console,
) /* tslint:enable */;
export const logError = /* tslint:disable */ console.error.bind(
    console,
  ) /* tslint:enable */;
export const time = /* tslint:disable */ console.time.bind(
    console,
  ) /* tslint:enable */;
export const timeEnd = /* tslint:disable */ console.timeEnd.bind(
    console,
  ) /* tslint:enable */;
