// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';

import {jugglerModule, bindModel, DataSource, Model, juggler} from '../../../lib/legacy';

describe('legacy loopback-datasource-juggler', function() {
  var ds:juggler.DataSource;

  before(function() {
    ds = new DataSource({
      name: 'db',
      connector: 'memory'
    });
    expect(ds.settings.name).to.eql('db');
    expect(ds.settings.connector).to.eql('memory');
  });

  it('creates models', function() {
    let Note = ds.createModel('note', {title: 'string', content: 'string'}, {});
    let Note2 = bindModel(ds, Note);
    expect(Note2.modelName).to.eql('note');
  });
});
