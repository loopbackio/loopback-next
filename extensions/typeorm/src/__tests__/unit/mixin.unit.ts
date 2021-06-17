// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {TypeOrmMixin} from '../../';

describe('TypeOrmMixin unit tests', () => {
  class AppUsingTypeOrm extends TypeOrmMixin(Application) {}
  let app: AppUsingTypeOrm;

  beforeEach(getApp);

  it('adds essential members', async () => {
    expect(app).to.have.property('connectionManager');
    expect(app).to.have.property('connection');
    expect(app).to.have.property('migrateSchema');
  });

  async function getApp() {
    app = new AppUsingTypeOrm();
  }
});
