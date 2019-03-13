import * as actionIndex from '../actions/_index';
import Db from '../Db';

/**
 * Takes a db object and binds it to each action in the actions index.
 * Returns an action index where the keys match the action names and the
 * values are action run functions with the db prebound.
 */
export default function bindDbToActions(db: Db): ActionRunIndex {
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
 * Just like `ActionIndex` except the object values are action run functions with the db argument pre-bound.
 * For example:
 *
 * ```ts
 * type ActionIndex = {
 *  foo: Action<FooProps, FooResult>;
 *  bar: Action<BarProps, BarResult>;
 * };
 *
 * type ActionRunIndex = {
 *  foo(props: FooProps): Promise<FooResult>;
 *  bar(props: BarProps): Promise<BarResult>;
 * }
 * ```
 */
export type ActionRunIndex = {
  [Key in keyof ActionIndex]: BoundRun<ActionIndex[Key]['run']>
};

type ActionIndex = typeof actionIndex;
type BoundRun<F> = F extends (db: any, props: infer G) => infer R
  ? (props: G) => R
  : never;
