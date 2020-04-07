// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  AnyObject,
  Count,
  CrudRepository,
  DataObject,
  DefaultCrudRepository,
  DefaultKeyValueRepository,
  defineCrudRepositoryClass,
  defineKeyValueRepositoryClass,
  defineRepositoryClass,
  Entity,
  Filter,
  juggler,
  model,
  Model,
  property,
  Where,
} from '../../..';

describe('RepositoryClass builder', () => {
  describe('defineRepositoryClass', () => {
    it('should generate custom repository class', async () => {
      const AddressRepository = defineRepositoryClass<
        typeof Address,
        DummyCrudRepository<Address>
      >(Address, DummyCrudRepository);
      // `CrudRepository.prototype.find` is inherited
      expect(AddressRepository.prototype.find).to.be.a.Function();
      // `DummyCrudRepository.prototype.findByTitle` is inherited
      expect(AddressRepository.prototype.findByTitle).to.be.a.Function();
      expect(AddressRepository.name).to.equal('AddressRepository');
      expect(Object.getPrototypeOf(AddressRepository)).to.equal(
        DummyCrudRepository,
      );
    });
  });

  describe('defineCrudRepositoryClass', () => {
    it('should generate entity CRUD repository class', async () => {
      const ProductRepository = defineCrudRepositoryClass(Product);

      expect(ProductRepository.name).to.equal('ProductRepository');
      expect(ProductRepository.prototype.find).to.be.a.Function();
      expect(ProductRepository.prototype.findById).to.be.a.Function();
      expect(Object.getPrototypeOf(ProductRepository)).to.equal(
        DefaultCrudRepository,
      );
    });
  });

  describe('defineKeyValueRepositoryClass', () => {
    it('should generate key value repository class', async () => {
      const ProductRepository = defineKeyValueRepositoryClass(Product);

      expect(ProductRepository.name).to.equal('ProductRepository');
      expect(ProductRepository.prototype.get).to.be.a.Function();
      expect(Object.getPrototypeOf(ProductRepository)).to.equal(
        DefaultKeyValueRepository,
      );
    });
  });

  @model()
  class Product extends Entity {
    @property({id: true})
    id: number;

    @property()
    name: string;
  }

  @model()
  class Address extends Model {
    @property()
    street: string;

    @property()
    city: string;

    @property()
    state: string;
  }

  class DummyCrudRepository<M extends Model> implements CrudRepository<M> {
    constructor(
      private modelCtor: typeof Model & {prototype: M},
      private dataSource: juggler.DataSource,
    ) {}
    create(
      dataObject: DataObject<M>,
      options?: AnyObject | undefined,
    ): Promise<M> {
      throw new Error('Method not implemented.');
    }
    createAll(
      dataObjects: DataObject<M>[],
      options?: AnyObject | undefined,
    ): Promise<M[]> {
      throw new Error('Method not implemented.');
    }
    find(
      filter?: Filter<M> | undefined,
      options?: AnyObject | undefined,
    ): Promise<(M & {})[]> {
      throw new Error('Method not implemented.');
    }
    updateAll(
      dataObject: DataObject<M>,
      where?: Where<M> | undefined,
      options?: AnyObject | undefined,
    ): Promise<Count> {
      throw new Error('Method not implemented.');
    }
    deleteAll(
      where?: Where<M> | undefined,
      options?: AnyObject | undefined,
    ): Promise<Count> {
      throw new Error('Method not implemented.');
    }
    count(
      where?: Where<M> | undefined,
      options?: AnyObject | undefined,
    ): Promise<Count> {
      throw new Error('Method not implemented.');
    }

    // An extra method to verify it's available for the defined repo class
    findByTitle(title: string): Promise<M[]> {
      throw new Error('Method not implemented.');
    }
  }
});
