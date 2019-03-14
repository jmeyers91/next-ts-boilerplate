import Migration from '../_core/Migration';
import * as create_user_table from './20190212182006_create_user_table';
import * as create_post_table from './20190212182007_create_post_table';

const migrations: Migration[] = [create_user_table, create_post_table];

export default migrations;
