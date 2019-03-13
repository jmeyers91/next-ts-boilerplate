import Koa from 'koa';
import KoaBodyparser from 'koa-bodyparser';
import koaHelmet from 'koa-helmet';
import errorMiddleware from 'src/middleware/errorMiddleware';
import jwtMiddleware from 'koa-jwt';
import dbMiddleware from 'src/middleware/dbMiddleware';
import getKnex from 'src/knex';
import log, { logError } from 'src/utils/log';
import apiRouter from 'src/routes/_index';

/**
 * Handles creating the Koa webserver, attaching middleware, and listening for changes.
 */
export default class ServerApi {
  /**
   * Start the webserver on the passed port.
   *
   * @param port - The port to listen to API requests on.
   * @returns A promise that resolves if the server starts successfully.
   */
  listen(port: number): Promise<void> {
    const secret = process.env.API_SECRET;
    if (!secret) {
      throw new Error(`You must define the API_SECRET environmental variable.`);
    }
    const koa = new Koa()
      .use(koaHelmet()) // Add security headers
      .use(errorMiddleware()) // Log requests and handle errors
      .use(KoaBodyparser()) // Parse request body
      .use(dbMiddleware(getKnex())) // Attach knex to context
      .use(
        jwtMiddleware({
          // Parse JWT auth tokens in `authToken` cookie or `Authorization` header.
          secret,
          passthrough: true,
          getToken(context): string {
            const cookie = context.cookies.get('authToken');
            if (cookie) {
              return cookie;
            }
            const header = context.request.headers.Authorization;
            if (header) {
              return header;
            }
            return '';
          },
        }),
      )
      .use(apiRouter.routes())
      .use(apiRouter.allowedMethods());

    return new Promise((resolve, reject) => {
      koa.listen(port, (error?: Error) => {
        if (error) {
          logError('Failed to start koa server', error);
          reject(error);
        } else {
          log(`Listening on port ${port}`);
          resolve();
        }
      });
    });
  }
}
