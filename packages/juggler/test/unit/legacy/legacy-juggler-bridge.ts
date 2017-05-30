// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';

import {jugglerModule, bindModel, DataSource, juggler, DefaultCrudRepository}
  from '../../../src/legacy-juggler-bridge';

describe('legacy loopback-datasource-juggler', () => {
  let ds: juggler.DataSource;

  before(function() {
    ds = new DataSource({
      name: 'db',
      connector: 'memory',
    });
    expect(ds.settings.name).to.eql('db');
    expect(ds.settings.connector).to.eql('memory');
  });

  it('creates models', () => {
    /* tslint:disable-next-line:variable-name */
    const Note = <typeof juggler.PersistedModel>
      ds.createModel('note', {title: 'string', content: 'string'}, {});
    /* tslint:disable-next-line:variable-name */
    const Note2 = bindModel(Note, ds);
    expect(Note2.modelName).to.eql('note');
    expect(Note2.definition).to.eql(Note.definition);
    expect(Note2.create).to.exactly(Note.create);
  });

  it('implements Repository.create()', async () => {
    /* tslint:disable-next-line:variable-name */
    const Note3 = <typeof juggler.PersistedModel>
      ds.createModel('note3', { title: 'string', content: 'string' }, {});
    const repo = new DefaultCrudRepository(Note3, ds);
    const note = await repo.create({ title: 't3', content: 'c3' });
    const result = await repo.findById(note.id);
    expect(result.toJSON()).to.eql(note.toJSON());
  });

  it('implements Repository.find()', async () => {
    /* tslint:disable-next-line:variable-name */
    const Note = <typeof juggler.PersistedModel>
      ds.createModel('note4', { title: 'string', content: 'string' }, {});
    const repo = new DefaultCrudRepository(Note, ds);
    await repo.createAll([
      { title: 't1', content: 'c1' },
      { title: 't2', content: 'c2'}]);
    const notes = await repo.find({where: {title: 't1'}});
    expect(notes.length).to.eql(1);
  });
});
