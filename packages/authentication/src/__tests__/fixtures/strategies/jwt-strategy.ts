// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, inject} from '@loopback/context';
import {HttpErrors, Request} from '@loopback/rest';
import {asAuthenticationStrategy} from '../../../decorators/authentication-extension.constants';
import {AuthenticationStrategy, UserProfile} from '../../../types';
import {JWTAuthenticationStrategyBindings} from '../keys';
import {JWTService} from '../services/jwt-service';

@bind(asAuthenticationStrategy)
export class JWTAuthenticationStrategy implements AuthenticationStrategy {
  name: string = 'jwt';

  constructor(
    @inject(JWTAuthenticationStrategyBindings.TOKEN_SERVICE)
    public token_service: JWTService,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const token: string = this.extractCredentals(request);
    const userProfile: UserProfile = await this.token_service.verifyToken(
      token,
    );
    return userProfile;
  }

  extractCredentals(request: Request): string {
    if (!request.headers.access_token) {
      //throw an error
      throw new HttpErrors['NotFound'](`'access_token' header not found.`);
    } //if

    let token: string;

    if (typeof request.headers.access_token === 'string') {
      token = request.headers.access_token;
    } else {
      //throw an error
      throw new HttpErrors['NotFound'](
        `'access_token' header of type 'string' not found.`,
      );
    }

    return token;
  }
}
