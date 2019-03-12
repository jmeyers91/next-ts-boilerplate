import { Model as BaseModel, snakeCaseMappers } from 'objection';

export default class Model extends BaseModel {
  // convert snake_case to camelCase
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
}
