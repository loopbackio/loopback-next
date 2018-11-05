// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Entity,
  EntityNotFoundError,
  juggler,
  ModelDefinition,
  DefaultAtomicCrudRepository,
} from '../../..';

describe('AtomicCrudRepository', () => {
  let ds: juggler.DataSource;

  class Note extends Entity {
    static definition = new ModelDefinition({
      name: 'Note',
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

  context('constructor', () => {
    class ShoppingList extends Entity {
      static definition = new ModelDefinition({
        name: 'ShoppingList',
        properties: {
          id: {
            type: 'number',
            id: true,
          },
          created: {
            type: () => Date,
          },
          toBuy: {
            type: 'array',
            itemType: 'string',
          },
          toVisit: {
            type: Array,
            itemType: () => String,
          },
        },
      });

      created: Date;
      toBuy: String[];
      toVisit: String[];
    }

    it('converts PropertyDefinition with array type', () => {
      const originalPropertyDefinition = Object.assign(
        {},
        ShoppingList.definition.properties,
      );
      const listDefinition = new DefaultAtomicCrudRepository(ShoppingList, ds)
        .modelClass.definition;
      const jugglerPropertyDefinition = {
        created: {type: Date},
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

    it('throws if a connector instance is not defined for a datasource', () => {
      const dsWithoutConnector = new juggler.DataSource({
        name: 'ds2',
      });
      let repo;
      expect(() => {
        repo = new DefaultAtomicCrudRepository(
          ShoppingList,
          dsWithoutConnector,
        );
      }).to.throw(
        /Connector instance must exist and support atomic operations/,
      );
    });

    it('shares the backing PersistedModel across repo instances', () => {
      const model1 = new DefaultAtomicCrudRepository(Note, ds).modelClass;
      const model2 = new DefaultAtomicCrudRepository(Note, ds).modelClass;

      expect(model1 === model2).to.be.true();
    });
  });

  context('Non atomic CRUD operations', () => {
    it('implements Repository.create()', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      const note = await repo.create({title: 't3', content: 'c3'});
      const result = await repo.findById(note.id);
      expect(result.toJSON()).to.eql(note.toJSON());
    });

    it('implements Repository.createAll()', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      const notes = await repo.createAll([
        {title: 't3', content: 'c3'},
        {title: 't4', content: 'c4'},
      ]);
      expect(notes.length).to.eql(2);
    });

    it('implements Repository.find()', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      await repo.createAll([
        {title: 't1', content: 'c1'},
        {title: 't2', content: 'c2'},
      ]);
      const notes = await repo.find({where: {title: 't1'}});
      expect(notes.length).to.eql(1);
    });

    it('implements Repository.findOne()', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
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
      const repo = new DefaultAtomicCrudRepository(Note, ds);
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

    describe('findById', () => {
      it('returns the correct instance', async () => {
        const repo = new DefaultAtomicCrudRepository(Note, ds);
        const note = await repo.create({
          title: 'a-title',
          content: 'a-content',
        });
        const result = await repo.findById(note.id);
        expect(result && result.toJSON()).to.eql(note.toJSON());
      });

      it('throws when the instance does not exist', async () => {
        const repo = new DefaultAtomicCrudRepository(Note, ds);
        await expect(repo.findById(999999)).to.be.rejectedWith({
          code: 'ENTITY_NOT_FOUND',
          message: 'Entity not found: Note with id 999999',
        });
      });
    });

    it('implements Repository.delete()', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      const note = await repo.create({title: 't3', content: 'c3'});

      await repo.delete(note);

      const found = await repo.find({where: {id: note.id}});
      expect(found).to.be.empty();
    });

    it('implements Repository.deleteById()', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      const note = await repo.create({title: 't3', content: 'c3'});

      await repo.deleteById(note.id);

      const found = await repo.find({where: {id: note.id}});
      expect(found).to.be.empty();
    });

    it('throws EntityNotFoundError when deleting an unknown id', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      await expect(repo.deleteById(99999)).to.be.rejectedWith(
        EntityNotFoundError,
      );
    });

    it('implements Repository.deleteAll()', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      await repo.create({title: 't3', content: 'c3'});
      await repo.create({title: 't4', content: 'c4'});
      const result = await repo.deleteAll({title: 't3'});
      expect(result.count).to.eql(1);
    });

    it('implements Repository.updateById()', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      const note = await repo.create({title: 't3', content: 'c3'});

      const id = note.id;
      const delta = {content: 'c4'};
      await repo.updateById(id, delta);

      const updated = await repo.findById(id);
      expect(updated.toJSON()).to.eql(Object.assign(note.toJSON(), delta));
    });

    it('throws EntityNotFound error when updating an unknown id', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      await expect(repo.updateById(9999, {title: 't4'})).to.be.rejectedWith(
        EntityNotFoundError,
      );
    });

    it('implements Repository.updateAll()', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      await repo.create({title: 't3', content: 'c3'});
      await repo.create({title: 't4', content: 'c4'});
      const result = await repo.updateAll({content: 'c5'}, {});
      expect(result.count).to.eql(2);
      const notes = await repo.find({where: {title: 't3'}});
      expect(notes[0].content).to.eql('c5');
    });

    it('implements Repository.updateAll() without a where object', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      await repo.create({title: 't3', content: 'c3'});
      await repo.create({title: 't4', content: 'c4'});
      const result = await repo.updateAll({content: 'c5'});
      expect(result.count).to.eql(2);
      const notes = await repo.find();
      const titles = notes.map(n => `${n.title}:${n.content}`);
      expect(titles).to.deepEqual(['t3:c5', 't4:c5']);
    });

    it('implements Repository.count()', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      await repo.create({title: 't3', content: 'c3'});
      await repo.create({title: 't4', content: 'c4'});
      const result = await repo.count();
      expect(result.count).to.eql(2);
    });

    it('implements Repository.save() without id', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      const note = await repo.save(new Note({title: 't3', content: 'c3'}));
      const result = await repo.findById(note!.id);
      expect(result.toJSON()).to.eql(note!.toJSON());
    });

    it('implements Repository.save() with id', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      const note1 = await repo.create({title: 't3', content: 'c3'});
      note1.content = 'c4';
      const note = await repo.save(note1);
      const result = await repo.findById(note!.id);
      expect(result.toJSON()).to.eql(note1.toJSON());
    });

    it('implements Repository.replaceById()', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      const note = await repo.create({title: 't3', content: 'c3'});
      await repo.replaceById(note.id, {title: 't4', content: undefined});
      const result = await repo.findById(note.id);
      expect(result.toJSON()).to.eql({
        id: note.id,
        title: 't4',
        content: undefined,
      });
    });

    it('throws EntityNotFound error when replacing an unknown id', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      await expect(repo.replaceById(9999, {title: 't4'})).to.be.rejectedWith(
        EntityNotFoundError,
      );
    });

    it('implements Repository.exists()', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      const note1 = await repo.create({title: 't3', content: 'c3'});
      const ok = await repo.exists(note1.id);
      expect(ok).to.be.true();
    });
  });

  context('Atomic CRUD operations', () => {
    // TODO: how can we test a connector that doesn't have findOrCreate?
    it('uses findOrCreate to create an instance if not found', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      const result = await repo.findOrCreate(
        {where: {title: 't1'}},
        {title: 'new t1', content: 'new c1'},
      );
      expect(result[0].toJSON()).to.containEql({
        title: 'new t1',
        content: 'new c1',
      });
      expect(result[1]).to.be.true();
    });
    it('uses findOrCreate to find an existing instance', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      await repo.createAll([
        {title: 't1', content: 'c1'},
        {title: 't2', content: 'c2'},
      ]);
      const result = await repo.findOrCreate(
        {where: {title: 't1'}},
        {title: 'new t1', content: 'new c1'},
      );
      expect(result[0].toJSON()).to.containEql({
        title: 't1',
        content: 'c1',
      });
      expect(result[1]).to.be.false();
    });
  });
});
