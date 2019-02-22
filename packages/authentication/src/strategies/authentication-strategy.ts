import {inject} from '@loopback/core';
import {AuthenticationBindings} from '../keys';
import {AuthenticationServices} from '../services';
import {UserProfile, AuthenticatedUser, Credentials} from '../types';
import {Entity} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {toJSON} from '@loopback/testlab';
import * as _ from 'lodash';

/**
 * An interface describes the common authentication strategy.
 *
 * An authentication strategy is usually a class with an
 * authenticate method that verifies a user's identity and
 * returns the corresponding user profile.
 *
 * Please note this file should be moved to @loopback/authentication
 */
export abstract class AuthenticationStrategy {
  constructor(
    @inject(AuthenticationBindings.SERVICES)
    private services: AuthenticationServices,
  ) {}
  abstract async authenticateRequest(
    request: Request,
  ): Promise<UserProfile | undefined>;

  async authenticateUser<U extends Entity>(
    credentials: Credentials,
  ): Promise<AuthenticatedUser<U>> {
    return this.services.authenticateUser(credentials);
  }

  async comparePassword<T = string>(
    credentialPass: T,
    userPass: T,
  ): Promise<boolean> {
    return this.services.comparePassword(credentialPass, userPass);
  }

  async generateAccessToken(user: UserProfile): Promise<string> {
    return this.services.generateAccessToken(user);
  }

  async decodeAccessToken(token: string): Promise<UserProfile | undefined> {
    return this.services.decodeAccessToken(token);
  }

  async getAccessTokenForUser(credentials: Credentials): Promise<string> {
    const user = await this.authenticateUser(credentials);
    // There is no guarantee that an Entity contains field `password`
    const userWithPassword = Object.assign({password: ''}, user);
    const passwordMatched = await this.comparePassword(
      credentials.password,
      userWithPassword.password,
    );
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('The credentials are not correct.');
    }

    const userProfile = _.pick(toJSON(user), ['id', 'email', 'firstName']);
    const token = await this.generateAccessToken(userProfile);
    return token;
  }
}
