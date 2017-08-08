// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as http from 'http';
import {HttpErrors, inject, ParsedRequest} from '@loopback/core';
import {Provider, Getter, Setter} from '@loopback/context';
import {Strategy} from 'passport';
import {StrategyAdapter} from '../strategy-adapter';
import {BindingKeys} from '../keys';

/**
 * interface definition of a function which accepts a request
 * and returns an authenticated user
 */
export interface AuthenticateFn {
  (request: ParsedRequest): Promise<UserProfile>;
}

/**
 * interface definition of a user profile
 * http://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
 */
export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
}

/**
 * @description Provider of a function which authenticates
 * @example `context.bind('authentication_key')
 *   .toProvider(AuthenticationProvider)`
 */
export class AuthenticationProvider implements Provider<AuthenticateFn> {
  constructor(
    // The provider is instantiated for Sequence constructor,
    // at which time we don't have information about the current
    // route yet. This information is needed to determine
    // what auth strategy should be used.
    // To solve this, we are injecting a getter function that will
    // defer resolution of the strategy until authenticate() action
    // is executed.
    @inject.getter(BindingKeys.Authentication.STRATEGY)
    readonly getStrategy: () => Promise<Strategy>,
    @inject.setter(BindingKeys.Authentication.CURRENT_USER)
    readonly setCurrentUser: (value: UserProfile) => void,
  ) {}

  /**
   * @returns authenticateFn
   */
  value(): AuthenticateFn {
    return async (request: ParsedRequest) => {
      return await authenticateRequest(
        this.getStrategy,
        request,
        this.setCurrentUser,
      );
    };
  }
}

/**
 * The implementation of authenticate() sequence action.
 * @param strategy Passport strategy
 * @param request Parsed Request
 * @param setCurrentUser The setter function to update the current user
 *   in the per-request Context
 */
async function authenticateRequest(
  getStrategy: Getter<Strategy>,
  request: ParsedRequest,
  setCurrentUser: Setter<UserProfile>,
): Promise<UserProfile> {
  const strategy = await getStrategy();
  if (!strategy.authenticate) {
    return Promise.reject(new Error('invalid strategy parameter'));
  }
  const strategyAdapter = new StrategyAdapter(strategy);
  const user = await strategyAdapter.authenticate(request);
  setCurrentUser(user);
  return user;
}
