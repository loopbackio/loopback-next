import {inject} from '@loopback/context';
import {HttpErrors} from '@loopback/rest';
import {UserProfile, UserService} from '../../../types';
import {BasicAuthenticationStrategyBindings} from '../keys';
import {BasicAuthenticationStrategyCredentials} from '../strategies/basic-strategy';
import {User} from '../users/user';
import {UserRepository} from '../users/user.repository';

export class BasicAuthenticationUserService
  implements UserService<User, BasicAuthenticationStrategyCredentials> {
  constructor(
    @inject(BasicAuthenticationStrategyBindings.USER_REPO)
    private userRepository: UserRepository,
  ) {}

  async verifyCredentials(
    credentials: BasicAuthenticationStrategyCredentials,
  ): Promise<User> {
    const foundUser = await this.userRepository.find(
      credentials.email,
      credentials.password,
    );
    if (!foundUser) {
      throw new HttpErrors['NotFound'](
        `User with email ${credentials.email} not found.`,
      );
    }

    if (credentials.password !== foundUser.password) {
      throw new HttpErrors.Unauthorized('The credentials are not correct.');
    } //if

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    let userProfile: UserProfile = {
      id: user.id,
      name: `${user.firstname} ${user.surname}`,
      email: user.email,
    };

    return userProfile;
  }
}
