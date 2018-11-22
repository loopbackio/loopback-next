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
  DefaultCrudRepository,
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
  });

  context('DefaultCrudRepository', () => {
    it('Implements same functionalities as DefaultCrudRepo', async () => {
      const repo = new DefaultAtomicCrudRepository(Note, ds);
      expect(repo.create).to.equal(DefaultCrudRepository.prototype.create);
      expect(repo.createAll).to.equal(
        DefaultCrudRepository.prototype.createAll,
      );
      expect(repo.find).to.equal(DefaultCrudRepository.prototype.find);
      expect(repo.findOne).to.equal(DefaultCrudRepository.prototype.findOne);
      expect(repo.findById).to.equal(DefaultCrudRepository.prototype.findById);
      expect(repo.delete).to.equal(DefaultCrudRepository.prototype.delete);
      expect(repo.deleteAll).to.equal(
        DefaultCrudRepository.prototype.deleteAll,
      );
      expect(repo.deleteById).to.equal(
        DefaultCrudRepository.prototype.deleteById,
      );
      expect(repo.update).to.equal(DefaultCrudRepository.prototype.update);
      expect(repo.updateAll).to.equal(
        DefaultCrudRepository.prototype.updateAll,
      );
      expect(repo.updateById).to.equal(
        DefaultCrudRepository.prototype.updateById,
      );
      expect(repo.count).to.equal(DefaultCrudRepository.prototype.count);
      expect(repo.save).to.equal(DefaultCrudRepository.prototype.save);
      expect(repo.replaceById).to.equal(
        DefaultCrudRepository.prototype.replaceById,
      );
      expect(repo.exists).to.equal(DefaultCrudRepository.prototype.exists);
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
