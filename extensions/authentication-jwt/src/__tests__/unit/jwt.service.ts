// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {HttpErrors} from '@loopback/rest';
import {securityId} from '@loopback/security';
import {expect} from '@loopback/testlab';
import {JWTService} from '../../';

describe('token service', () => {
  const USER_PROFILE = {
    email: 'test@email.com',
    [securityId]: '1',
    name: 'test',
  };
  // the jwt service only preserves field 'id' and 'name'
  const DECODED_USER_PROFILE = {
    id: '1',
    name: 'test',
  };

  const TOKEN_SECRET_VALUE = 'myjwts3cr3t';
  const TOKEN_EXPIRES_IN_VALUE = '60';

  const jwtService = new JWTService(TOKEN_SECRET_VALUE, TOKEN_EXPIRES_IN_VALUE);

  it('token service generateToken() succeeds', async () => {
    const token = await jwtService.generateToken(USER_PROFILE);
    expect(token).to.not.be.empty();
  });

  it('token service verifyToken() succeeds', async () => {
    const token = await jwtService.generateToken(USER_PROFILE);
    const userProfileFromToken = await jwtService.verifyToken(token);
    expect(userProfileFromToken).to.deepEqual(DECODED_USER_PROFILE);
  });

  it('token service verifyToken() fails', async () => {
    const expectedError = new HttpErrors.Unauthorized(
      `Error verifying token : invalid token`,
    );
    const invalidToken = 'aaa.bbb.ccc';
    await expect(jwtService.verifyToken(invalidToken)).to.be.rejectedWith(
      expectedError,
    );
  });
});
