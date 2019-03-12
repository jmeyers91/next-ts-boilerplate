import Migration from '../Migration';

export default async function loadMigrations(): Promise<Migration[]> {
  return Promise.all([
    import('./20190212182007_create_post_table'),
    import('./20190212182006_create_user_table'),
  ]);
}
