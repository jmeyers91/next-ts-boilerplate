import { Middleware } from 'koa';
import Db from '../Db';
import bindDbToActions from './bindDbToActions';

/**
 * Attaches database to context under the key `db`.
 *
 * @param knex - The knex instance to use.
 */
export default function dbMiddleware(db: Db): Middleware {
  const actions = bindDbToActions(db);

  return function dbMiddlewareHandler(context, next) {
    context.db = db;
    context.actions = actions;
    return next();
  };
}
