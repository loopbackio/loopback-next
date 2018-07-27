// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';

import {
  juggler,
  bindModel,
  DefaultCrudRepository,
  Entity,
  ModelDefinition,
} from '../../../';

describe('legacy loopback-datasource-juggler', () => {
  let ds: juggler.DataSource;

  before(function() {
    ds = new juggler.DataSource({
      name: 'db',
      connector: 'memory',
    });
    expect(ds.settings.name).to.eql('db');
    expect(ds.settings.connector).to.eql('memory');
  });

  it('creates models', () => {
    /* tslint:disable-next-line:variable-name */
    const Note = ds.createModel<juggler.PersistedModelClass>(
      'note',
      {title: 'string', content: 'string', id: {type: 'number', id: true}},
      {},
    );
    /* tslint:disable-next-line:variable-name */
    const Note2 = bindModel(Note, ds);
    expect(Note2.modelName).to.eql('note');
    expect(Note2.definition).to.eql(Note.definition);
    expect(Note2.create).to.exactly(Note.create);
  });
});

describe('DefaultCrudRepository', () => {
  let ds: juggler.DataSource;

  class Note extends Entity {
    static definition = new ModelDefinition({
      name: 'note3',
      properties: {
        title: 'string',
        content: 'string',
        id: {name: 'id', type: 'number', id: true},
      },
    });

    title?: string;
    content?: string;
    id: number;

    constructor(data: Partial<Note>) {
      super(data);
    }
  }

  beforeEach(() => {
    ds = new juggler.DataSource({
      name: 'db',
      connector: 'memory',
    });
  });

  afterEach(async () => {
    const model = ds.createModel<typeof juggler.PersistedModel>('note3');
    model.attachTo(ds);
    await model.deleteAll();
  });

  context('constructor', () => {
    class ShoppingList extends Entity {
      static definition = new ModelDefinition({
        name: 'ShoppingList',
        properties: {
          id: {
            type: 'number',
            id: true,
          },
          toBuy: {
            type: 'array',
            itemType: 'string',
          },
          toVisit: {
            type: Array,
            itemType: String,
          },
        },
      });

      toBuy: String[];
      toVisit: String[];
    }

    it('converts PropertyDefinition with array type', () => {
      const originalPropertyDefinition = Object.assign(
        {},
        ShoppingList.definition.properties,
      );
      const listDefinition = new DefaultCrudRepository(ShoppingList, ds)
        .modelClass.definition;
      const jugglerPropertyDefinition = {
        toBuy: {
          type: [String],
        },
        toVisit: {
          type: [String],
        },
      };

      expect(listDefinition.properties).to.containDeep(
        jugglerPropertyDefinition,
      );
      expect(ShoppingList.definition.properties).to.containDeep(
        originalPropertyDefinition,
      );
    });
  });

  it('shares the backing PersistedModel across repo instances', () => {
    const model1 = new DefaultCrudRepository(Note, ds).modelClass;
    const model2 = new DefaultCrudRepository(Note, ds).modelClass;

    expect(model1 === model2).to.be.true();
  });

  it('implements Repository.create()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note = await repo.create({title: 't3', content: 'c3'});
    const result = await repo.findById(note.id);
    expect(result.toJSON()).to.eql(note.toJSON());
  });

  it('implements Repository.createAll()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const notes = await repo.createAll([
      {title: 't3', content: 'c3'},
      {title: 't4', content: 'c4'},
    ]);
    expect(notes.length).to.eql(2);
  });

  it('implements Repository.find()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    await repo.createAll([
      {title: 't1', content: 'c1'},
      {title: 't2', content: 'c2'},
    ]);
    const notes = await repo.find({where: {title: 't1'}});
    expect(notes.length).to.eql(1);
  });

  it('implements Repository.findOne()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    await repo.createAll([
      {title: 't1', content: 'c1'},
      {title: 't1', content: 'c2'},
    ]);
    const note = await repo.findOne({
      where: {title: 't1'},
      order: ['content DESC'],
    });
    expect(note).to.not.be.null();
    expect(note && note.title).to.eql('t1');
    expect(note && note.content).to.eql('c2');
  });
  it('returns null if Repository.findOne() does not return a value', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    await repo.createAll([
      {title: 't1', content: 'c1'},
      {title: 't1', content: 'c2'},
    ]);
    const note = await repo.findOne({
      where: {title: 't5'},
      order: ['content DESC'],
    });
    expect(note).to.be.null();
  });

  it('implements Repository.delete()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note = await repo.create({title: 't3', content: 'c3'});
    const result = await repo.delete(note);
    expect(result).to.eql(true);
  });

  it('implements Repository.deleteById()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note = await repo.create({title: 't3', content: 'c3'});
    const result = await repo.deleteById(note.id);
    expect(result).to.eql(true);
  });

  it('implements Repository.deleteAll()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    await repo.create({title: 't3', content: 'c3'});
    await repo.create({title: 't4', content: 'c4'});
    const result = await repo.deleteAll({title: 't3'});
    expect(result).to.eql(1);
  });

  it('implements Repository.updateById()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note = await repo.create({title: 't3', content: 'c3'});
    note.content = 'c4';
    const id = note.id;
    delete note.id;
    const result = await repo.updateById(id, note);
    expect(result).to.eql(true);
  });

  it('implements Repository.updateAll()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    await repo.create({title: 't3', content: 'c3'});
    await repo.create({title: 't4', content: 'c4'});
    const result = await repo.updateAll({content: 'c5'}, {});
    expect(result).to.eql(2);
    const notes = await repo.find({where: {title: 't3'}});
    expect(notes[0].content).to.eql('c5');
  });

  it('implements Repository.updateAll() without a where object', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    await repo.create({title: 't3', content: 'c3'});
    await repo.create({title: 't4', content: 'c4'});
    const result = await repo.updateAll({content: 'c5'});
    expect(result).to.eql(2);
    const notes = await repo.find();
    const titles = notes.map(n => `${n.title}:${n.content}`);
    expect(titles).to.deepEqual(['t3:c5', 't4:c5']);
  });

  it('implements Repository.count()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    await repo.create({title: 't3', content: 'c3'});
    await repo.create({title: 't4', content: 'c4'});
    const result = await repo.count();
    expect(result).to.eql(2);
  });

  it('implements Repository.save() without id', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note = await repo.save(new Note({title: 't3', content: 'c3'}));
    const result = await repo.findById(note!.id);
    expect(result.toJSON()).to.eql(note!.toJSON());
  });

  it('implements Repository.save() with id', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note1 = await repo.create({title: 't3', content: 'c3'});
    note1.content = 'c4';
    const note = await repo.save(note1);
    const result = await repo.findById(note!.id);
    expect(result.toJSON()).to.eql(note1.toJSON());
  });

  it('implements Repository.replaceById()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note1 = await repo.create({title: 't3', content: 'c3'});
    note1.title = 't4';
    note1.content = undefined;
    const ok = await repo.replaceById(note1.id, note1);
    expect(ok).to.be.true();
    const result = await repo.findById(note1.id);
    expect(result.toJSON()).to.eql(note1.toJSON());
  });

  it('implements Repository.exists()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note1 = await repo.create({title: 't3', content: 'c3'});
    const ok = await repo.exists(note1.id);
    expect(ok).to.be.true();
  });

  it('throws if findById does not return a value', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    try {
      await repo.findById(999999);
    } catch (err) {
      expect(err).to.match(/no Note was found with id/);
      return;
    }
    throw new Error('No error was returned!');
  });
});
