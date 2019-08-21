// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {HttpErrors} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {UserService} from '../../../services/user.service';
import {createUserProfile} from '../helper';
import {USER_REPO} from '../keys';
import {BasicAuthenticationStrategyCredentials} from '../strategies/basic-strategy';
import {User} from '../users/user';
import {UserRepository} from '../users/user.repository';

export class BasicAuthenticationUserService
  implements UserService<User, BasicAuthenticationStrategyCredentials> {
  constructor(
    @inject(USER_REPO)
    private userRepository: UserRepository,
  ) {}

  async verifyCredentials(
    credentials: BasicAuthenticationStrategyCredentials,
  ): Promise<User> {
    if (!credentials) {
      throw new HttpErrors.Unauthorized(`'credentials' is null`);
    }

    if (!credentials.username) {
      throw new HttpErrors.Unauthorized(`'credentials.username' is null`);
    }

    if (!credentials.password) {
      throw new HttpErrors.Unauthorized(`'credentials.password' is null`);
    }

    const foundUser = this.userRepository.find(credentials.username);
    if (!foundUser) {
      throw new HttpErrors['Unauthorized'](
        `User with username ${credentials.username} not found.`,
      );
    }

    if (credentials.password !== foundUser.password) {
      throw new HttpErrors.Unauthorized('The password is not correct.');
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    if (!user) {
      throw new HttpErrors.Unauthorized(`'user' is null`);
    }

    if (!user.id) {
      throw new HttpErrors.Unauthorized(`'user id' is null`);
    }

    return createUserProfile(user);
  }
}
