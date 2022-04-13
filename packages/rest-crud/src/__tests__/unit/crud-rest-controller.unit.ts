// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/rest-crud
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, model, property} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {defineCrudRestController} from '../..';

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
});
