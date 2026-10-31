// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/rest-crud
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Entity,
  EntityCrudRepository,
  Filter,
  model,
  property,
} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {CrudRestControllerOptions, defineCrudRestController} from '../..';

describe('defineCrudRestController', () => {
  it('should generate controller based on Model name', async () => {
    @model()
    class Product extends Entity {
      @property({id: true})
      id: number;
    }

    const CrudRestController = defineCrudRestController<
      Product,
      typeof Product.prototype.id,
      'id'
    >(Product, {basePath: '/products'});

    expect(CrudRestController.name).to.equal('ProductController');
  });

  it('should generate controller based on Model name with readonly APIs', async () => {
    @model()
    class Product extends Entity {
      @property({id: true})
      id: number;
    }

    const CrudRestController = defineCrudRestController<
      Product,
      typeof Product.prototype.id,
      'id'
    >(Product, {basePath: '/products', readonly: true});

    expect(CrudRestController.name).to.equal('ProductController');

    // It should not generate create method
    expect(CrudRestController.prototype.create).to.equal(undefined);

    // It must generate read methods
    expect(CrudRestController.prototype.find).not.equal(undefined);
  });

  it('passes options parameter to repository methods', async () => {
    @model()
    class Product extends Entity {
      @property({id: true})
      id: number;
    }

    const controllerOptions = {
      basePath: '/products',
    };

    const CrudRestController = defineCrudRestController<
      Product,
      typeof Product.prototype.id,
      'id'
    >(Product, controllerOptions);

    let passedOptions: CrudRestControllerOptions = {basePath: '/'};
    const mockRepo = {
      find: async (
        filter: Filter<Product>,
        options: CrudRestControllerOptions,
      ) => {
        passedOptions = options;
        return [];
      },
    } as unknown as EntityCrudRepository<Product, typeof Product.prototype.id>;

    const controller = new CrudRestController(mockRepo);

    await controller.find();
    expect(passedOptions).to.deepEqual(controllerOptions);
  });
});
