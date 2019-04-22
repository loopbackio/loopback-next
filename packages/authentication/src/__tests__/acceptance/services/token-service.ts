// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {HttpErrors} from '@loopback/rest';
import {promisify} from 'util';
import {TokenService} from '../../../services/token.service';
import {UserProfile} from '../../../types';
import {JWTAuthenticationStrategyBindings} from '../keys';
const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService implements TokenService {
  constructor(
    @inject(JWTAuthenticationStrategyBindings.TOKEN_SECRET)
    private jwt_secret: string,
    @inject(JWTAuthenticationStrategyBindings.TOKEN_EXPIRES_IN)
    private jwt_expiresIn: string,
  ) {}

  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors['Unauthorized'](
        `Error verifying token : 'token' is null`,
      );
    } //if

    let userProfile: UserProfile;

    try {
      // decode user profile from token
      userProfile = await verifyAsync(token, this.jwt_secret);
    } catch (error) {
      throw new HttpErrors['Unauthorized'](`Error verifying token : ${error}`);
    }

    return userProfile;
  }

  async generateToken(userProfile: UserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors['Unauthorized'](
        'Error generating token : userProfile is null',
      );
    } //if

    if (!userProfile.id) {
      throw new HttpErrors['Unauthorized'](
        `Error generating token : userProfile 'id'  is null`,
      );
    } //if

    if (!userProfile.email) {
      throw new HttpErrors['Unauthorized'](
        `Error generating token : userProfile 'email'  is null`,
      );
    } //if

    if (!userProfile.name) {
      throw new HttpErrors['Unauthorized'](
        `Error generating token : userProfile 'name'  is null`,
      );
    } //if

    const userInfoForToken = {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
    };

    // Generate a JSON Web Token
    let token: string;
    try {
      token = await signAsync(userInfoForToken, this.jwt_secret, {
        expiresIn: Number(this.jwt_expiresIn),
      });
    } catch (error) {
      throw new HttpErrors['Unauthorized'](`Error encoding token : ${error}`);
    }

    return token;
  }
}
