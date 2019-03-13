import { createUser } from '../createUser.action';
import Db from '../../db';
import runMigrations from '../../entries/migrate';

const db = Db.getDefault();

afterAll(() => db.knex.destroy());

describe('createUser.action', () => {
  test('Should run successfully with valid inputs', async () => {
    await runMigrations(db);
    const result = await createUser.run(db, {
      email: 'test-email@test.com',
      password: 'secret',
      firstName: 'firstname',
      lastName: 'lastname',
    });
    expect(result).toBeTruthy();
  });

  test('Should throw an error with missing inputs', async () => {
    const inputs = {
      email: 'test-email2@test.com',
      password: 'secret',
      firstName: 'firstname',
      lastName: 'lastname',
    };
    delete inputs.email;
    await runMigrations(db);
    await expect(createUser.run(db, inputs)).rejects.toThrow(
      /validation failed/,
    );
  });

  test('Should throw an error with incorrect input types', async () => {
    const inputs = {
      email: 10,
      password: 'secret',
      firstName: 'firstname',
      lastName: 'lastname',
    };
    await runMigrations(db);
    await expect(createUser.run(db, inputs)).rejects.toThrow(
      /validation failed/,
    );
  });
});
