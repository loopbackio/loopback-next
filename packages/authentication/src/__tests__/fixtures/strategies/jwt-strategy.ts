// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {HttpErrors, Request} from '@loopback/rest';
import {AuthenticationStrategy, UserProfile} from '../../../types';
import {JWTAuthenticationStrategyBindings} from '../keys';
import {JWTService} from '../services/jwt-service';

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
    if (!request.headers.authorization) {
      //throw an error
      throw new HttpErrors.Unauthorized(`Authorization header not found.`);
    } //if

    // for example : Bearer xxx.yyy.zzz
    let auth_header_value = request.headers.authorization;

    if (!auth_header_value.startsWith('Bearer')) {
      //throw an error
      throw new HttpErrors.Unauthorized(
        `Authorization header is not of type 'Bearer'.`,
      );
    } //if

    //split the string into 2 parts : 'Bearer ' and the `xxx.yyy.zzz`
    let parts = auth_header_value.split(' ');
    const token = parts[1];

    return token;
  }
}
