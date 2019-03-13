import Db from './Db';
import runMigrations from '../entries/migrate';

const baseDb = Db.getDefault();
beforeAll(() => runMigrations(baseDb));
afterAll(() => baseDb.destroy());

/**
 * Alias to `Db.getDefault().test(...)`
 */
export const dbTest = baseDb.test.bind(baseDb);
