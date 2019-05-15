// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/security
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {DefaultSubject, securityId, UserProfile} from '../..';

describe('DefaultSubject', () => {
  it('adds users', () => {
    const subject = new DefaultSubject();
    const user: UserProfile = {[securityId]: 'user-001', type: 'USER'};
    subject.addUser(user);
    expect(subject.user).to.eql(user);
  });
});
