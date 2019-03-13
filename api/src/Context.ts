import { Context as KoaContext } from 'koa';
import Db from './Db';
import { ActionRunIndex } from './utils/bindDbToActions';

export interface CustomContext {
  /** added in middleware/dbMiddleware.ts */
  db: Db;
  /** added in middleware/dbMiddleware.ts */
  actions: ActionRunIndex;
}

/** Koa context with additional fields defined in CustomContext */
type Context = KoaContext & CustomContext;
export default Context;
