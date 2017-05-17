// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';

import {jugglerModule, bindModel, DataSource, juggler, DefaultCrudRepository}
  from '../../../src/legacy';

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
    let Note =<typeof juggler.PersistedModel>
      ds.createModel('note', {title: 'string', content: 'string'}, {});
    let Note2 = bindModel(Note, ds);
    expect(Note2.modelName).to.eql('note');
    expect(Note2.definition).to.eql(Note.definition);
    expect(Note2.create).to.exactly(Note.create);
  });

  it('implements Repository interface', function () {
    let Note3 = <typeof juggler.PersistedModel>
      ds.createModel('note3', { title: 'string', content: 'string' }, {});
    let repo = new DefaultCrudRepository(Note3, ds);
    return repo.create({ title: 't3', content: 'c3' }).then((note) => {
      return repo.findById(note.id).then((result) => {
        expect(result.toJSON()).to.eql(note.toJSON());
      });
    });
  });
});
