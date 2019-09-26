import {MyUser} from './user';

export class MyUserRepository {
  constructor(readonly list: {[key: string]: MyUser}) {}
  find(name: string): MyUser | undefined {
    const found = Object.keys(this.list).find(k => this.list[k].name === name);
    return found ? this.list[found] : undefined;
  }
}

export const SAMPLE_USER_MIN_SET = {
  id: 1,
  name: 'joe',
  city: 'NYC',
  worksFromRemote: true,
};

export const SAMPLE_USER = {
  ...SAMPLE_USER_MIN_SET,
  password: 'joepa55w0rd',
  otherProperties: {
    foo: 'foo',
    bar: 1,
  },
};

export const MY_USER_1 = new MyUser(SAMPLE_USER);

export const MY_USER_2 = new MyUser({
  id: 2,
  name: 'jill',
  password: 'jillpa55w0rd',
  city: 'Toronto',
  otherProperties: {
    foo: 'foo',
    bar: 1,
  },
});

/**
 * Returns a stub user repository
 */
export function getMyUserRepository(): MyUserRepository {
  return new MyUserRepository({
    joe888: MY_USER_1,
    jill888: MY_USER_2,
  });
}
