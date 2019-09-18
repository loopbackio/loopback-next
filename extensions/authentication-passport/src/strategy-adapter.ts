// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/authentication-passport
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  AuthenticationStrategy,
  convertUserToUserProfileFn,
} from '@loopback/authentication';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {Strategy} from 'passport';

const passportRequestMixin = require('passport/lib/http/request');

/**
 * Adapter class to invoke passport-strategy
 *   1. provides express dependencies to the passport strategies
 *   2. provides shimming of requests for passport authentication
 *   3. provides lifecycle similar to express to the passport-strategy
 *   4. provides state methods to the strategy instance
 * see: https://github.com/jaredhanson/passport
 */
export class StrategyAdapter<U> implements AuthenticationStrategy {
  /**
   * @param strategy instance of a class which implements a passport-strategy;
   * @description http://passportjs.org/
   */
  constructor(
    private readonly strategy: Strategy,
    readonly name: string,
    private userConverter?: convertUserToUserProfileFn<U>,
  ) {}

  /**
   * The function to invoke the contained passport strategy.
   *     1. Create an instance of the strategy
   *     2. add success and failure state handlers
   *     3. authenticate using the strategy
   * @param request The incoming request.
   */
  authenticate(request: Request): Promise<UserProfile> {
    const self = this;
    return new Promise<UserProfile>((resolve, reject) => {
      // mix-in passport additions like req.logIn and req.logOut
      for (const key in passportRequestMixin) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (request as any)[key] = passportRequestMixin[key];
      }

      // create a prototype chain of an instance of a passport strategy
      const strategy = Object.create(this.strategy);

      // add success state handler to strategy instance
      // as a generic adapter, it is agnostic of the type of
      // the custom user, so loose the type restriction here
      // to be `any`
      strategy.success = function(user: any) {
        if (self.userConverter) {
          const userProfile = self.userConverter(user);
          resolve(userProfile);
        } else {
          resolve(user);
        }
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
