// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {CompatApp, createCompatApplication} from './compat-app';

describe('v3compat (acceptance)', () => {
  let app: CompatApp;

  beforeEach(async function givenApplication() {
    app = await createCompatApplication();
  });

  it('registers datasource with LB4 app', () => {
    const created = app.v3compat.dataSource('db', {connector: 'memory'});
    const bound = app.getSync('datasources.db');
    expect(bound).to.equal(created);
  });
});
