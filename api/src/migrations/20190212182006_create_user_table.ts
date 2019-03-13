import { upTable, downTable } from '../_core/Migration';
export const name = '20190212182006_create_user_table';

export const up = upTable('user', t => {
  t.increments('id').primary();
  t.timestamps(true, true);
  t.string('email')
    .notNullable()
    .unique();
  t.string('password').notNullable();
  t.string('firstName').notNullable();
  t.string('lastName').notNullable();
});

export const down = downTable('user');
