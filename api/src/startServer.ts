import Koa from 'koa';
import KoaBodyparser from 'koa-bodyparser';
import koaHelmet from 'koa-helmet';
import jwtMiddleware from 'koa-jwt';
import log, { logError } from 'src/utils/log';
import Router from 'src/_core/Router';
import Context from 'src/_core/Context';
import Db from 'src/_core/Db';
import errorMiddleware from 'src/_core/utils/errorMiddleware';
import dbMiddleware from 'src/_core/utils/dbMiddleware';
import routers from 'src/routes/_index';

/**
 * Creates the koa webserver and attaches middleware and routers.
 *
 * @param port - The port for the server to listen on.
 * @param db - The Db instance to run the server against.
 * @returns Promise<void>
 */
export default async function startServer(port: number, db: Db): Promise<void> {
  const secret = process.env.API_SECRET;
  if (!secret) {
    throw new Error(`You must define the API_SECRET environmental variable.`);
  }

  const apiRouter = new Router().prefix('/api');
  const koa = new Koa()
    .use(koaHelmet()) // Add security headers
    .use(errorMiddleware()) // Log requests and handle errors
    .use(KoaBodyparser()) // Parse request body
    .use(dbMiddleware(db)) // Attach knex to context
    .use(
      // Parse auth token from requests
      jwtMiddleware({
        secret,
        passthrough: true,
        getToken: getAuthTokenFromContext,
      }),
    );

  // Attach routers to root API router
  for (const router of routers) {
    apiRouter.use(router.routes()).use(router.allowedMethods());
  }

  // Attach root API router to Koa app
  koa.use(apiRouter.routes()).use(apiRouter.allowedMethods());

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

/**
 * Retrieves the auth token from either an `authToken` cookie or `Authorization` header.
 *
 * @param context - Koa app context
 * @returns Auth token string. Returns a blank string if no token is found.
 */
function getAuthTokenFromContext(context: Context): string {
  const cookie = context.cookies.get('authToken');
  if (cookie) {
    return cookie;
  }
  const header = context.request.headers.Authorization;
  if (header) {
    return header;
  }
  return '';
}
