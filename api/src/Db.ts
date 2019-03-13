import Knex from 'knex';
import getModels, { ModelIndex } from './models/_index';
import getKnex from './knex';

let singletonDb: Db | undefined;

export default class Db {
  /**
   * Get the singleton database. Useful during testing.
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
    this.models = getModels(knex);
  }
}
