// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';

import {jugglerModule, bindModel, DataSourceConstructor, juggler, DefaultCrudRepository}
  from '../../../src/legacy-juggler-bridge';

/* tslint:disable-next-line:variable-name */
type PersistedModelClass = typeof juggler.PersistedModel;

describe('legacy loopback-datasource-juggler', () => {
  let ds: juggler.DataSource;

  before(function() {
    ds = new DataSourceConstructor({
      name: 'db',
      connector: 'memory',
    });
    expect(ds.settings.name).to.eql('db');
    expect(ds.settings.connector).to.eql('memory');
  });

  it('creates models', () => {
    /* tslint:disable-next-line:variable-name */
    const Note = ds.createModel<PersistedModelClass>(
      'note', {title: 'string', content: 'string'}, {});
    /* tslint:disable-next-line:variable-name */
    const Note2 = bindModel(Note, ds);
    expect(Note2.modelName).to.eql('note');
    expect(Note2.definition).to.eql(Note.definition);
    expect(Note2.create).to.exactly(Note.create);
  });
});

describe('DefaultCrudRepository', () => {
  let ds: juggler.DataSource;
  /* tslint:disable-next-line:variable-name */
  let Note: PersistedModelClass;

  beforeEach(() => {
    ds = new DataSourceConstructor({
      name: 'db',
      connector: 'memory',
    });
    Note = ds.createModel<PersistedModelClass>(
      'note3', { title: 'string', content: 'string' }, {});
    Note.prototype.getId = function() {
      /* tslint:disable-next-line:no-invalid-this */
      return this.id;
    };
  });

  afterEach(async () => {
    await Note.deleteAll();
  });

  it('implements Repository.create()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note = await repo.create({ title: 't3', content: 'c3' });
    const result = await repo.findById(note.id);
    expect(result.toJSON()).to.eql(note.toJSON());
  });

  it('implements Repository.createAll()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const notes = await repo.createAll([
      { title: 't3', content: 'c3' },
      { title: 't4', content: 'c4' }]);
    expect(notes.length).to.eql(2);
  });

  it('implements Repository.find()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    await repo.createAll([
      { title: 't1', content: 'c1' },
      { title: 't2', content: 'c2' }]);
    const notes = await repo.find({ where: { title: 't1' } });
    expect(notes.length).to.eql(1);
  });

  it('implements Repository.delete()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note = await repo.create({ title: 't3', content: 'c3' });
    const result = await repo.delete(note);
    expect(result).to.eql(true);
  });

  it('implements Repository.deleteById()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note = await repo.create({ title: 't3', content: 'c3' });
    const result = await repo.deleteById(note.id);
    expect(result).to.eql(true);
  });

  it('implements Repository.deleteAll()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note1 = await repo.create({ title: 't3', content: 'c3' });
    const note2 = await repo.create({ title: 't4', content: 'c4' });
    const result = await repo.deleteAll({ title: 't3' });
    expect(result).to.eql(1);
  });

  it('implements Repository.updateById()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note = await repo.create({ title: 't3', content: 'c3' });
    note.content = 'c4';
    const id = note.id;
    delete note.id;
    const result = await repo.updateById(id, note);
    expect(result).to.eql(true);
  });

  it('implements Repository.updateAll()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note1 = await repo.create({ title: 't3', content: 'c3' });
    const note2 = await repo.create({ title: 't4', content: 'c4' });
    const result = await repo.updateAll({content: 'c5'}, {});
    expect(result).to.eql(2);
    const notes = await repo.find({where: {title: 't3'}});
    expect(notes[0].content).to.eql('c5');
  });

  it('implements Repository.count()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note1 = await repo.create({ title: 't3', content: 'c3' });
    const note2 = await repo.create({ title: 't4', content: 'c4' });
    const result = await repo.count();
    expect(result).to.eql(2);
  });

  it('implements Repository.save() without id', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note = await repo.save({ title: 't3', content: 'c3' });
    const result = await repo.findById(note.id);
    expect(result.toJSON()).to.eql(note.toJSON());
  });

  it('implements Repository.save() with id', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note1 = await repo.create({ title: 't3', content: 'c3' });
    note1.content = 'c4';
    const note = await repo.save(note1);
    const result = await repo.findById(note.id);
    expect(result.toJSON()).to.eql(note1.toJSON());
  });

  it('implements Repository.replaceById()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note1 = await repo.create({ title: 't3', content: 'c3' });
    note1.title = 't4';
    delete note1.content;
    const ok = await repo.replaceById(note1.id, note1);
    expect(ok).to.be.true();
    const result = await repo.findById(note1.id);
    expect(result.toJSON()).to.eql(note1.toJSON());
  });

  it('implements Repository.exists()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note1 = await repo.create({ title: 't3', content: 'c3' });
    const ok = await repo.exists(note1.id);
    expect(ok).to.be.true();
  });

});
