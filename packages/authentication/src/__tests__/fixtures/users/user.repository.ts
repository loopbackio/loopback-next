// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {User} from './user';

export class UserRepository {
  constructor(readonly list: {[key: string]: User}) {}
  find(username: string): User | undefined {
    const found = Object.keys(this.list).find(
      k => this.list[k].username === username,
    );
    return found ? this.list[found] : undefined;
  }
}
