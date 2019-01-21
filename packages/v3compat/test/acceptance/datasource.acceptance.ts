// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RestApplication, RestServerConfig} from '@loopback/rest';
import {expect, givenHttpServerConfig} from '@loopback/testlab';
import {CompatMixin} from '../..';

describe('v3compat (acceptance)', () => {
  class CompatApp extends CompatMixin(RestApplication) {}

  let app: CompatApp;

  beforeEach(givenApplication);

  it('registers datasource with LB4 app', () => {
    const created = app.v3compat.dataSource('db', {connector: 'memory'});
    const bound = app.getSync('datasources.db');
    expect(bound).to.equal(created);
  });

  async function givenApplication() {
    const rest: RestServerConfig = Object.assign({}, givenHttpServerConfig());
    app = new CompatApp({rest});
  }
});
