// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-passport
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const _ = require('lodash');

/**
 * A simple User model
 */
export interface MyUser {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  email?: string;
  token?: string;
  signingKey: string;
}

/**
 * Repository to store and access user objects
 */
export class UserRepository {
  constructor(readonly list: {[key: string]: MyUser}) {}

  /**
   * find by username
   * @param username
   */
  find(username: string): MyUser {
    return _.filter(this.list, (user: MyUser) => user.username === username);
  }

  /**
   * find by id
   * @param id
   */
  findById(id: string): MyUser | undefined {
    const usr = _.filter(this.list, (user: MyUser) => user.id === id);
    if (usr.length > 0) return usr[0];
  }

  /**
   * create profile for external user
   * @param user
   */
  createExternalUser(user: MyUser) {
    this.list[user.id] = user;
  }
}

/**
 * Sample data to mock existing registered users
 * new users can be registered with the repository functions
 */
const userRepository = new UserRepository({
  '999': {
    id: '999',
    username: 'joesmith71',
    firstName: 'Joseph',
    lastName: 'Smith',
    signingKey: 'AZeb==',
  },
  '1000': {
    id: '1000',
    username: 'simonsmith71',
    firstName: 'Simon',
    lastName: 'Smith',
    signingKey: 'AZeb==',
  },
});

export {userRepository};
