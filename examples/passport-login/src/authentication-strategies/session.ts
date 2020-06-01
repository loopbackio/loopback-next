// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AuthenticationStrategy, asAuthStrategy} from '@loopback/authentication';
import {RedirectRoute, RequestWithSession, HttpErrors} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {User} from '../models';
import {bind} from '@loopback/core';
import {repository} from '@loopback/repository';
import {UserRepository} from '../repositories';
import {mapProfile} from './types';

@bind(asAuthStrategy)
export class SessionStrategy implements AuthenticationStrategy {
  name = 'session';

  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  /**
   * authenticate a request
   * @param request
   */
  async authenticate(
    request: RequestWithSession,
  ): Promise<UserProfile | RedirectRoute | undefined> {
    if (!request.session || !request.session.user) {
      throw new HttpErrors.Unauthorized(`Invalid Session`);
    }
    const user: User = request.session.user as User;
    if (!user.email || !user.id) {
      throw new HttpErrors.Unauthorized(`Invalid user profile`);
    }
    const users: User[] = await this.userRepository.find({
      where: {
        email: user.email,
      },
    });
    if (!users || !users.length) {
      throw new HttpErrors.Unauthorized(`User not registered`);
    }
    return mapProfile(request.session.user as User);
  }
}
