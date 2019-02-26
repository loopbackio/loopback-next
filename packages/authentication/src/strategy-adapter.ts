// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {HttpErrors, Request} from '@loopback/rest';
import {Strategy} from 'passport';
import {UserProfile} from './types';

const passportRequestMixin = require('passport/lib/http/request');

/**
 * @deprecated
 *
 * THIS CLASS IS DEPRECATED.
 * We will be adding a new package to implement one or more new passport
 * strategy adapters.
 *
 * Adapter class to invoke passport-strategy
 *   1. provides express dependencies to the passport strategies
 *   2. provides shimming of requests for passport authentication
 *   3. provides lifecycle similar to express to the passport-strategy
 *   3. provides state methods to the strategy instance
 * see: https://github.com/jaredhanson/passport
 */
export class StrategyAdapter {
  /**
   * @param strategy - instance of a class which implements a passport-strategy
   *
   * @{@link http://passportjs.org/ | Passport}
   */
  constructor(private readonly strategy: Strategy) {}

  /**
   * The function to invoke the contained passport strategy.
   *     1. Create an instance of the strategy
   *     2. add success and failure state handlers
   *     3. authenticate using the strategy
   * @param request - The incoming request.
   */
  authenticate(request: Request): Promise<UserProfile> {
    return new Promise<UserProfile>((resolve, reject) => {
      // mix-in passport additions like req.logIn and req.logOut
      for (const key in passportRequestMixin) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (request as any)[key] = passportRequestMixin[key];
      }

      // create a prototype chain of an instance of a passport strategy
      const strategy = Object.create(this.strategy);

      // add success state handler to strategy instance
      strategy.success = function(user: UserProfile) {
        resolve(user);
      };

      // add failure state handler to strategy instance
      strategy.fail = function(challenge: string) {
        reject(new HttpErrors.Unauthorized(challenge));
      };

      // add error state handler to strategy instance
      strategy.error = function(error: string) {
        reject(new HttpErrors.InternalServerError(error));
      };

      // authenticate
      strategy.authenticate(request);
    });
  }
}
