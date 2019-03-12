import { createAssertType } from 'typescript-is';
import Action from '../Action';

interface Props {
  blarb: string;
  dsadsa: number;
}

interface Result {
  dsajdsa: string;
  aksdkao: boolean;
  dshuai: number;
}

export const foo = new Action<Props, Result>(async (db, props) => {
  return {
    dsajdsa: 'dsadsjadsa',
    aksdkao: false,
    dshuai: 10,
  };
}).validate(createAssertType<Props>(), createAssertType<Result>());
