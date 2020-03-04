// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {
  AndClause,
  AnyObject,
  Condition,
  Count,
  CrudRepository,
  DataObject,
  DefaultCrudRepository,
  DefaultKeyValueRepository,
  defineCrudRepositoryClass,
  defineEntityCrudRepositoryClass,
  defineKeyValueRepositoryClass,
  Entity,
  Filter,
  juggler,
  model,
  Model,
  OrClause,
  property,
} from '../../..';

describe('RepositoryClass builder', () => {
  describe('defineCrudRepositoryClass', () => {
    it('should generate CRUD repository class', async () => {
      const AddressRepository = defineCrudRepositoryClass(
        Address,
        DummyCrudRepository,
      );
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

  describe('defineEntityCrudRepositoryClass', () => {
    it('should generate entity CRUD repository class', async () => {
      const ProductRepository = defineEntityCrudRepositoryClass(Product);

      expect(ProductRepository.name).to.equal('ProductRepository');
      expect(ProductRepository.prototype.find).to.be.a.Function();
      expect(ProductRepository.prototype.findById).to.be.a.Function();
      expect(Object.getPrototypeOf(ProductRepository)).to.equal(
        DefaultCrudRepository,
      );
    });
  });

  describe('defineEntityCrudRepositoryClass with custom base class', () => {
    it('should generate entity CRUD repository class', async () => {
      class BaseProductRepository extends DefaultCrudRepository<
        Product,
        number
      > {
        async findByName(name: string): Promise<Product[]> {
          return this.find({where: {name}});
        }
      }

      const ProductRepository = defineEntityCrudRepositoryClass(
        Product,
        BaseProductRepository,
      );

      expect(ProductRepository.name).to.equal('ProductRepository');
      expect(ProductRepository.prototype.find).to.be.a.Function();
      expect(ProductRepository.prototype.findById).to.be.a.Function();
      expect(Object.getPrototypeOf(ProductRepository)).to.equal(
        BaseProductRepository,
      );
    });
  });

  describe('defineEntityKeyValueRepositoryClass', () => {
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
      private modelCtor: Constructor<M>,
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
      where?: Condition<M> | AndClause<M> | OrClause<M> | undefined,
      options?: AnyObject | undefined,
    ): Promise<Count> {
      throw new Error('Method not implemented.');
    }
    deleteAll(
      where?: Condition<M> | AndClause<M> | OrClause<M> | undefined,
      options?: AnyObject | undefined,
    ): Promise<Count> {
      throw new Error('Method not implemented.');
    }
    count(
      where?: Condition<M> | AndClause<M> | OrClause<M> | undefined,
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
