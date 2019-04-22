// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {User} from './user';

export class UserRepository {
  constructor(readonly list: {[key: string]: {user: User}}) {}
  find(email: string, password: string): User | undefined {
    const userList = this.list;
    function search(key: string) {
      return userList[key].user.email === email;
    }
    const found = Object.keys(userList).find(search);
    if (found) {
      return userList[found].user;
    } //if

    return undefined;
  }
}
