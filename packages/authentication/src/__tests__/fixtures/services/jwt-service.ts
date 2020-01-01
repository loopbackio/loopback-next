// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {promisify} from 'util';
import {TokenService} from '../../../services/token.service';
import {JWTAuthenticationStrategyBindings} from '../keys';
const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService implements TokenService {
  constructor(
    @inject(JWTAuthenticationStrategyBindings.TOKEN_SECRET)
    private jwtSecret: string,
    @inject(JWTAuthenticationStrategyBindings.TOKEN_EXPIRES_IN)
    private jwtExpiresIn: string,
  ) {}

  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : 'token' is null`,
      );
    }

    let userProfile: UserProfile;

    try {
      // decode user profile from token
      userProfile = await verifyAsync(token, this.jwtSecret);
      userProfile[securityId] = userProfile.id; //because [securityId] is a Symbol and couldn't be saved in the token, we need recreate it here.
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : ${error.message}`,
      );
    }

    return userProfile;
  }

  async generateToken(userProfile: UserProfile | undefined): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized(
        'Error generating token : userProfile is null',
      );
    }

    // Generate a JSON Web Token
    let token: string;
    try {
      token = await signAsync(userProfile, this.jwtSecret, {
        expiresIn: Number(this.jwtExpiresIn),
      });
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error encoding token : ${error}`);
    }

    return token;
  }
}
