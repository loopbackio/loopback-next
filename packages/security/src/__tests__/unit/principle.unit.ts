// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/security
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Principal, securityId, TypedPrincipal} from '../..';

describe('typed principle', () => {
  it('returns the security id', () => {
    const principal: Principal = {[securityId]: 'auser'};
    const typedPrincipal = new TypedPrincipal(principal, 'USER');
    expect(typedPrincipal[securityId]).to.eql('USER:auser');
  });
});
