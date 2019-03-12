import { Context as KoaContext } from 'koa';
import Db from './Db';
import { ActionRunIndex } from './middleware/dbMiddleware';

export interface CustomContext {
  /** added in middleware/dbMiddleware.ts */
  db: Db;
  actions: ActionRunIndex;
}

/** Koa context with additional fields defined in CustomContext */
type Context = KoaContext & CustomContext;
export default Context;
