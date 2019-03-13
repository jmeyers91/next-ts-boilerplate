import { createAssertType } from 'typescript-is';
import Action from '../Action';

interface Props {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface Result {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * Create a user
 */
export const createUser = new Action<Props, Result>(async (db, props) => {
  const { User } = db.models;
  const { email, password, firstName, lastName } = props;
  const user = await User.query().insertAndFetch({
    email,
    password,
    firstName,
    lastName,
  });

  return user;
}).validate(createAssertType<Props>(), createAssertType<Result>());
