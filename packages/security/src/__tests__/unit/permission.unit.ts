// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/security
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Permission} from '../..';
import {securityId} from '../../types';

describe('Permission', () => {
  it('generates security id', () => {
    const permission = new Permission();
    permission.action = 'create';
    permission.resourceType = 'order';
    expect(permission[securityId]).to.eql('order:create');
  });

  it('generates security id with resource property', () => {
    const permission = new Permission();
    permission.action = 'read';
    permission.resourceType = 'user';
    permission.resourceProperty = 'email';
    expect(permission[securityId]).to.eql('user.email:read');
  });

  it('generates security id with resource id', () => {
    const permission = new Permission();
    permission.action = 'delete';
    permission.resourceType = 'order';
    permission.resourceId = '001';
    expect(permission[securityId]).to.eql('order:delete:001');
  });
});
