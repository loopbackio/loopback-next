// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AuthenticationStrategy, asAuthStrategy} from '@loopback/authentication';
import {StrategyAdapter} from '@loopback/authentication-passport';
import {Request, RedirectRoute} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {User} from '../models';
import {bind} from '@loopback/core';
import {BasicStrategy as Strategy} from 'passport-http';
import {repository} from '@loopback/repository';
import {UserRepository} from '../repositories';
import {mapProfile} from './types';

/**
 * basic passport strategy
 */
@bind(asAuthStrategy)
export class BasicStrategy implements AuthenticationStrategy {
  name = 'basic';
  passportstrategy: Strategy;
  strategy: StrategyAdapter<User>;

  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {
    /**
     * create a basic passport strategy with verify function to validate credentials
     */
    this.passportstrategy = new Strategy(this.verify.bind(this));
    /**
     * wrap the passport strategy instance with an adapter to plugin to LoopBack authentication
     */
    this.strategy = new StrategyAdapter(
      this.passportstrategy,
      this.name,
      mapProfile.bind(this),
    );
  }

  /**
   * authenticate a request
   * @param request
   */
  async authenticate(request: Request): Promise<UserProfile | RedirectRoute> {
    return this.strategy.authenticate(request);
  }

  /**
   * authenticate user with provided username and password
   *
   * @param username
   * @param password
   * @param done
   *
   * @returns User model
   */
  verify(
    username: string,
    password: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    done: (error: any, user?: any) => void,
  ): void {
    /**
     * A dummy admin user is required for ease of testing purposes.
     * TODO:
     *   enable roles and authorization, add user with admin roles in the
     * beginning of the tests
     */
    if (username === 'admin' && password === 'password') {
      return done(null, {
        id: 999,
        name: 'admin',
        username: 'admin',
        email: 'admin@example.com',
      });
    }

    this.userRepository
      .find({
        where: {
          email: username,
        },
        include: [
          {
            relation: 'profiles',
          },
          {
            relation: 'credentials',
          },
        ],
      })
      .then((users: User[]) => {
        if (!users || !users.length) {
          return done(null, false);
        }
        const user = users[0];
        if (!user.credentials || user.credentials.password !== password) {
          return done(null, false);
        }
        // Authentication passed, return user profile
        done(null, user);
      })
      .catch(err => {
        /**
         * Error occurred in authenticating process.
         * Does not necessarily mean an unauthorized user.
         */
        done(err);
      });
  }
}
