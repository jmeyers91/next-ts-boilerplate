import { dbTest } from 'src/_core/testUtils';
import { createUser } from '../createUser.action';

describe('createUser.action', () => {
  test(
    'Should run successfully with valid inputs',
    dbTest(async db => {
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
    dbTest(async db => {
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
    dbTest(async db => {
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
    dbTest(async db => {
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
    dbTest(async db => {
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
