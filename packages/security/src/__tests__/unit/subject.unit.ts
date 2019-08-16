// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/security
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  ClientApplication,
  DefaultSubject,
  securityId,
  UserProfile,
} from '../..';
import {Permission} from '../../types';

describe('DefaultSubject', () => {
  const subject = new DefaultSubject();
  it('adds users', () => {
    const user: UserProfile = {[securityId]: 'user-001', type: 'USER'};
    subject.addUser(user);
    expect(subject.user).to.eql(user);
  });

  it('adds application', () => {
    const app: ClientApplication = {
      [securityId]: 'app-001',
      type: 'APPLICATION',
    };
    subject.addApplication(app);
    expect(subject.getPrincipal('APPLICATION')).to.equal(app);
  });

  it('adds authority', () => {
    const perm1 = new Permission();
    perm1.action = 'get';
    perm1.resourceType = 'User';
    const perm2 = new Permission();
    perm2.action = 'update';
    perm2.resourceType = 'User';
    subject.addAuthority(perm1, perm2);
    expect(subject.authorities).to.containEql(perm1);
    expect(subject.authorities).to.containEql(perm2);
  });
  it('adds credential', () => {
    const cred = {usr: 'auser', pass: 'mypass'};
    subject.addCredential(cred);
    expect(subject.credentials).to.containEql(cred);
  });
});
