import { Middleware } from 'koa';
import chalk from 'chalk';

const styleStatus =
  process.env.NODE_ENV === 'development' ? styleStatusDev : styleStatusProd;

/**
 * Creates a Koa middleware for logging requests/responses and handling errors.
 *
 * @returns Koa middleware function.
 */
export default function createErrorMiddleware(): Middleware {
  return async function errorMiddleware(context, next): Promise<void> {
    const { request, response } = context;
    try {
      await next();
      /* tslint:disable */
      console.log(styleStatus(response.status), request.method, request.path);
      /* tslint:enable */
    } catch (error) {
      const status = error.status || 400;
      /* tslint:disable */
      console.log(
        styleStatus(status),
        request.method,
        request.path,
        error.stack || error.message,
      );
      /* tslint:enable */
      context.response.status = status;
      context.response.body = {
        success: false,
        status,
        error: {
          message: error.message,
          data: error.errors || undefined,
        },
      };
    }
  };
}

// >= 500 red, >= 400 yellow, 0-399 green
function styleStatusDev(status: number): string {
  const statusString = '' + status;
  if (status >= 500) {
    return chalk.red(statusString);
  }
  if (status >= 400) {
    return chalk.yellow(statusString);
  }
  return chalk.green(statusString);
}

// No colors in production
function styleStatusProd(status: number): string {
  return '' + status;
}
