import Knex from 'knex';

interface Migration {
  name: string;
  config?: Knex.MigratorConfig;
  up(knex: Knex): any;
  down(knex: Knex): any;
}

export default Migration;
