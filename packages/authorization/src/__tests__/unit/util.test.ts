// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authorization
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Principal, securityId, UserProfile} from '@loopback/security';
import {expect} from '@loopback/testlab';
import {createPrincipalFromUserProfile} from '../../util';

describe('utils', () => {
  it('generates the correct principal', () => {
    const userProfile: UserProfile = {
      [securityId]: 'auser',
      email: 'test@fake.com',
    };
    const expectedPrincipal: Principal = {
      [securityId]: 'auser',
      email: 'test@fake.com',
      name: 'auser',
      type: 'USER',
    };
    expect(createPrincipalFromUserProfile(userProfile)).to.deepEqual(
      expectedPrincipal,
    );
  });
});
