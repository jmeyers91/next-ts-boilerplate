import { createAssertType } from 'typescript-is';
import Action from 'src/_core/Action';

interface Props {
  blarb: string;
  dsadsa: number;
}

interface Result {
  dsajdsa: string;
  aksdkao: boolean;
  dshuai: number;
}

export const foo = new Action<Props, Result>(
  async (db, props) => {
    return {
      dsajdsa: 'foo',
      aksdkao: false,
      dshuai: 10,
    };
  },
  createAssertType<Props>(),
  createAssertType<Result>(),
);
