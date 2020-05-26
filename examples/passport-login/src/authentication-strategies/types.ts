// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import axios from 'axios';
import {Profile} from 'passport';
import {UserIdentityService} from '@loopback/authentication';
import {User} from '../models';
import {UserProfile, securityId} from '@loopback/security';

export type ProfileFunction = (
  accessToken: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  done: (err?: Error | null, profile?: any) => void,
) => void;

export type VerifyFunction = (
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  done: (error: any, user?: any, info?: any) => void,
) => void;

export namespace PassportAuthenticationBindings {
  export const OAUTH2_STRATEGY = 'passport.authentication.oauth2.strategy';
}

export const oauth2ProfileFunction: ProfileFunction = (
  accessToken: string,
  done,
) => {
  // call the profile url in the mock authorization app with the accessToken
  axios
    .get('http://localhost:9000/verify?access_token=' + accessToken, {
      headers: {Authorization: accessToken},
    })
    .then(response => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profile: any = response.data;
      profile.id = profile.userId;
      profile.emails = [{value: profile.email}];
      profile.provider = 'custom-oauth2';
      done(null, profile);
    })
    .catch(err => {
      done(err);
    });
};

/**
 * provides an appropriate verify function for oauth2 strategies
 * @param accessToken
 * @param refreshToken
 * @param profile
 * @param done
 */
export const verifyFunctionFactory = function (
  userService: UserIdentityService<Profile, User>,
): VerifyFunction {
  return function (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    done: (error: any, user?: any, info?: any) => void,
  ) {
    // look up a linked user for the profile
    userService
      .findOrCreateUser(profile)
      .then((user: User) => {
        done(null, user);
      })
      .catch((err: Error) => {
        done(err);
      });
  };
};

/**
 * map passport profile to UserProfile in `@loopback/security`
 * @param user
 */
export const mapProfile = function (user: User): UserProfile {
  const userProfile: UserProfile = {
    [securityId]: '' + user.id,
    profile: {
      ...user,
    },
  };
  return userProfile;
};
