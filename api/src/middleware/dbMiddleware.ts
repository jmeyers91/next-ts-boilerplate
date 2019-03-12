import Knex from 'knex';
import { Middleware } from 'koa';
import getModels from '../models/_index';
import Db from '../Db';
import * as actionIndex from '../actions/_index';

type ActionIndex = typeof actionIndex;
type BoundRun<F> = F extends (db: any, props: infer G) => infer R
  ? (props: G) => R
  : never;
export type ActionRunIndex = {
  [Key in keyof ActionIndex]: BoundRun<ActionIndex[Key]['run']>
};

/**
 * Takes a db object and binds it to each action in the actions index.
 * Returns an action index where the keys match the action names and the
 * values are action run functions with the db prebound.
 */
function bindDbToActions(db: Db): ActionRunIndex {
  const actionRunIndex: Record<string, BoundRun<any>> = {};
  for (const [key, action] of Object.entries(actionIndex)) {
    actionRunIndex[key] = (action.run as (
      this: typeof action,
      db: Db,
      props: any,
    ) => any).bind(action, db);
  }
  return actionRunIndex as ActionRunIndex;
}

/**
 * Attaches database to context under the key `db`.
 *
 * @param knex - The knex instance to use.
 */
export default function dbMiddleware(knex: Knex): Middleware {
  const db: Db = new Db(knex);
  const actions = bindDbToActions(db);

  return function dbMiddlewareHandler(context, next) {
    context.db = db;
    context.actions = actions;
    return next();
  };
}
