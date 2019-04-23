// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {HttpErrors, Request} from '@loopback/rest';
import {AuthenticationStrategy, UserProfile} from '../../../types';
import {BasicAuthenticationStrategyBindings} from '../keys';
import {BasicAuthenticationUserService} from '../services/basic-auth-user-service';

export interface BasicAuthenticationStrategyCredentials {
  email: string;
  password: string;
}

export class BasicAuthenticationStrategy implements AuthenticationStrategy {
  name: string = 'basic';

  constructor(
    @inject(BasicAuthenticationStrategyBindings.USER_SERVICE)
    private user_service: BasicAuthenticationUserService,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const credentials: BasicAuthenticationStrategyCredentials = this.extractCredentals(
      request,
    );
    const user = await this.user_service.verifyCredentials(credentials);
    const userProfile = this.user_service.convertToUserProfile(user);

    return userProfile;
  }

  extractCredentals(request: Request): BasicAuthenticationStrategyCredentials {
    if (!request.headers.authorization) {
      //throw an error
      throw new HttpErrors.Unauthorized(`Authorization header not found.`);
    } //if

    // for example : Basic Z2l6bW9AZ21haWwuY29tOnBhc3N3b3Jk
    let auth_header_value = request.headers.authorization;

    if (!auth_header_value.startsWith('Basic')) {
      //throw an error
      throw new HttpErrors.Unauthorized(
        `Authorization header is not of type 'Basic'.`,
      );
    } //if

    //split the string into 2 parts. We are interested in the base64 portion
    let parts = auth_header_value.split(' ');
    let encryptedCredentails = parts[1];

    // decrypt the credentials. Should look like :   'user_email_value:user_password_value'
    let decryptedCredentails = Buffer.from(
      encryptedCredentails,
      'base64',
    ).toString('utf8');

    //split the string into 2 parts
    let decryptedParts = decryptedCredentails.split(':');

    if (decryptedParts.length !== 2) {
      //throw an error
      throw new HttpErrors.Unauthorized(
        `Authorization header 'Basic' value does not contain two parts separated by ':'.`,
      );
    } //if

    let creds: BasicAuthenticationStrategyCredentials = {
      email: decryptedParts[0],
      password: decryptedParts[1],
    };

    return creds;
  }
}
