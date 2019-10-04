// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest-crud
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, model, property} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {defineCrudRepositoryClass} from '../..';

describe('defineCrudRepositoryClass', () => {
  it('should generate repository based on Model name', async () => {
    @model()
    class Product extends Entity {
      @property({id: true})
      id: number;
    }

    const ProductRepository = defineCrudRepositoryClass(Product);

    expect(ProductRepository.name).to.equal('ProductRepository');
  });
});
