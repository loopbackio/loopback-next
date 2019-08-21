// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {RestComponent} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {AuthenticationComponent} from '../..';
import {User} from './users/user';
import {UserRepository} from './users/user.repository';

/**
 * Returns an application that has loaded the authentication and rest components
 */
export function getApp(): Application {
  const app = new Application();
  app.component(AuthenticationComponent);
  app.component(RestComponent);
  return app;
}

/**
 * Returns a stub user repository
 */
export function getUserRepository(): UserRepository {
  return new UserRepository({
    joe888: {
      id: '1',
      firstName: 'joe',
      lastName: 'joeman',
      username: 'joe888',
      password: 'joepa55w0rd',
    },
    jill888: {
      id: '2',
      firstName: 'jill',
      lastName: 'jillman',
      username: 'jill888',
      password: 'jillpa55w0rd',
    },
    jack888: {
      id: '3',
      firstName: 'jack',
      lastName: 'jackman',
      username: 'jack888',
      password: 'jackpa55w0rd',
    },
    janice888: {
      id: '4',
      firstName: 'janice',
      lastName: 'janiceman',
      username: 'janice888',
      password: 'janicepa55w0rd',
    },
  });
}

/**
 * Creates a Basic Authorization header value
 *   Uses 'Basic ' as the prefix, unless another is provided
 *   Uses ':' as a separator, unless another is provided
 *   Can add an extra segment to create an invalid base64 string (for testing purposes)
 */
export interface BasicAuthorizationHeaderValueOptions {
  prefix?: string;
  separator?: string;
  extraSegment?: string;
}
export function createBasicAuthorizationHeaderValue(
  user: User,
  options?: BasicAuthorizationHeaderValueOptions,
): string {
  options = Object.assign(
    {
      prefix: 'Basic ',
      separator: ':',
      extraSegment: '',
    },
    options,
  );

  // sometimes used to create an invalid 3rd segment (for testing)
  let extraPart = '';
  if (options.extraSegment! !== '')
    extraPart = options.separator! + options.extraSegment!;

  return (
    options.prefix +
    Buffer.from(
      `${user.username}${options.separator}${user.password}${extraPart}`,
    ).toString('base64')
  );
}

export function createBearerAuthorizationHeaderValue(
  token: string,
  alternativePrefix?: string,
): string {
  // default type is 'Bearer ', unless another is specified
  const prefix = alternativePrefix ? alternativePrefix : 'Bearer ';
  return prefix + token;
}

export function createUserProfile(user: User): UserProfile {
  const userProfile: UserProfile = {[securityId]: '', name: ''};

  if (user.id) userProfile[securityId] = user.id;

  let userName = '';
  if (user.firstName) userName = user.firstName;
  if (user.lastName)
    userName = user.firstName ? `${userName} ${user.lastName}` : user.lastName;
  userProfile.name = userName;

  return userProfile;
}
