import { upTable, downTable } from '../_core/Migration';
export const name = '20190212182007_create_post_table';

export const up = upTable('post', t => {
  t.increments('id').primary();
  t.timestamps(true, true);
  t.string('title').notNullable();
  t.string('content').notNullable();
  t.integer('creator_id')
    .references('id')
    .inTable('user')
    .onDelete('SET NULL');
});

export const down = downTable('post');
