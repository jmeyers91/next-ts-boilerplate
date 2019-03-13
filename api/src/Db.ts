import Knex from 'knex';
import getBoundModels, { ModelIndex } from './models/_index';
import getKnex from './knex';

const IGNORE_ERROR = Symbol('IGNORE_ERROR');
let singletonDb: Db | undefined;

export default class Db {
  /**
   * Get the singleton database.
   *
   * @returns Cached Db instance
   */
  static getDefault(): Db {
    if (!singletonDb) {
      singletonDb = new Db(getKnex());
    }
    return singletonDb;
  }

  public models: ModelIndex;
  public knex: Knex;

  constructor(knex: Knex) {
    this.knex = knex;
    this.models = getBoundModels(knex);
  }

  /**
   * Runs the transaction body in a knex transaction and commits if it succeeds and rolls back
   * if it fails.
   *
   * @params transactionBody - The function that receives the transaction db.
   * @returns The return value of the transaction body.
   */
  async startTransaction<R>(transactionBody: DbTransactionBody<R>): Promise<R> {
    return await this.knex.transaction<R>(trx => {
      Promise.resolve()
        .then(() => transactionBody(new Db(trx)))
        .then(result => trx.commit(result))
        .catch(error => trx.rollback(error));
    });
  }

  /**
   * Runs the transaction body in a knex transaction and rolls back the database
   * when it finishes.
   *
   * @params transactionBody - The function that receives the transaction db.
   * @returns The return value of the transaction body.
   */
  async startTestTransaction<R>(
    transactionBody: DbTransactionBody<R>,
  ): Promise<R> {
    const { knex } = this;
    let result!: R;

    try {
      await knex.transaction(trx => {
        Promise.resolve()
          .then(() => transactionBody(new Db(trx)))
          .then(r => {
            result = r;
            return trx.rollback(IGNORE_ERROR);
          })
          .catch(error => trx.rollback(error));
      });
    } catch (error) {
      if (error !== IGNORE_ERROR) {
        throw error;
      }
    }
    return result;
  }

  /**
   * Returns a test run body that receives a transaction db instance as an argument.
   * Used to reduce boilerplate when running tests in transactions.
   *
   * @params testBody - The test body function. Receives a db instance.
   * @returns A test function intended to be passed to `it` or `test`.
   *
   * @example
   *
   * ```ts
   * const baseDb = Db.getDefault();
   *
   * beforeAll(() => runMigrations(baseDb));
   * afterAll(() => baseDb.knex.destroy());
   *
   * describe('posts', () => {
   *  test('Should be able to create a post', baseDb.test(async db => {
   *    const { Post } = db.models;
   *    // this insert will be rolled back after the test
   *    await Post.query().insert({ title: 'unique title', content: 'test content' });
   *  }));
   * });
   * ```
   */
  test<R>(testBody: DbTransactionBody<R>): () => Promise<void> {
    return async () => {
      await this.startTestTransaction(testBody);
    };
  }
}

type DbTransactionBody<R> = (db: Db) => R;
