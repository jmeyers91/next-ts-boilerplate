import Knex from 'knex';
import { Model } from 'objection';

import Post from './Post.model';
import User from './User.model';

const models = {
  Post,
  User,
};

/**
 * Type that describes an object with model names for keys and model classes for values.
 */
export type ModelIndex = typeof models;

/**
 * Binds the passed knex instance to each models and returns them.
 *
 * @params knex - The knex instance to bind the models to. Knex transactions can also be passed.
 * @returns A model class index object. Keys are model names, values are model classes
 */
export default function getBoundModels(knex: Knex): typeof models {
  const boundModels: Record<string, typeof Model> = {};
  for (const key in models) {
    if (models.hasOwnProperty(key)) {
      boundModels[key] = (models as { [key: string]: typeof Model })[
        key
      ].bindKnex(knex);
    }
  }
  return boundModels as typeof models;
}
