import { createUser } from '../createUser.action';
import Db from '../../db';
import runMigrations from '../../entries/migrate';

const baseDb = Db.getDefault();
beforeAll(() => runMigrations(baseDb));
afterAll(() => baseDb.knex.destroy());

describe('createUser.action', () => {
  test(
    'Should run successfully with valid inputs',
    baseDb.test(async db => {
      const result = await createUser.run(db, {
        email: 'test-email@test.com',
        password: 'secret',
        firstName: 'firstname',
        lastName: 'lastname',
      });
      expect(result).toBeTruthy();
    }),
  );

  test(
    'Should run successfully with valid inputs (transaction test)',
    baseDb.test(async db => {
      const result = await createUser.run(db, {
        email: 'test-email@test.com',
        password: 'secret',
        firstName: 'firstname',
        lastName: 'lastname',
      });
      expect(result).toBeTruthy();
    }),
  );

  test(
    'Should run successfully with valid inputs (transaction test 2)',
    baseDb.test(async db => {
      const result = await createUser.run(db, {
        email: 'test-email@test.com',
        password: 'secret',
        firstName: 'firstname',
        lastName: 'lastname',
      });
      expect(result).toBeTruthy();
      return result;
    }),
  );

  test(
    'Should throw an error with missing inputs',
    baseDb.test(async db => {
      const inputs = {
        email: 'test-email2@test.com',
        password: 'secret',
        firstName: 'firstname',
        lastName: 'lastname',
      };
      delete inputs.email;
      await expect(createUser.run(db, inputs)).rejects.toThrow(
        /validation failed/,
      );
    }),
  );

  test(
    'Should throw an error with incorrect input types',
    baseDb.test(async db => {
      const inputs = {
        email: 10,
        password: 'secret',
        firstName: 'firstname',
        lastName: 'lastname',
      };
      await expect(createUser.run(db, inputs)).rejects.toThrow(
        /validation failed/,
      );
    }),
  );
});
