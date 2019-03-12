import Knex from 'knex';
import getModels, { ModelIndex } from './models/_index';

export default class Db {
  public models: ModelIndex;
  public knex: Knex;

  constructor(knex: Knex) {
    this.knex = knex;
    this.models = getModels(knex);
  }
}
