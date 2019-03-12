import Knex from 'knex';
import { ModelIndex } from './models/_index';

type Seed = (models: ModelIndex, knex: Knex) => any;
export default Seed;
