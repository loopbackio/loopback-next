// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { belongsTo, Entity, hasMany, model, property } from '@loopback/repository';
import { expect } from '@loopback/testlab';
import { getControllerSpec, post, put } from '../../../..';
import { TS_TYPE_KEY } from '../../../../controller-spec';
import { newRequestBody1 } from '../../../../decorators/request-body.option1.decorator';

describe.only('spike - requestBody decorator', () => {
  context('proposal 1', () => {
    @model()
    class Product extends Entity {
      @property({
        type: 'string',
      })
      name: string;
      @belongsTo(() => Category)
      categoryId: number;

      constructor(data?: Partial<Product>) {
        super(data);
      }
    }

    /**
    * Navigation properties of the Product model.
    */
    interface ProductRelations {
      category?: CategoryWithRelations;
    }
    /**
    * Product's own properties and navigation properties.
    */
    type ProductWithRelations = Product & ProductRelations;

    @model()
    class Category extends Entity {
      @hasMany(() => Product)
      products?: Product[];
    }
    /**
    * Navigation properties of the Category model.
    */
    interface CategoryRelations {
      products?: ProductWithRelations[];
    }
    /**
    * Category's own properties and navigation properties.
    */
    type CategoryWithRelations = Category & CategoryRelations;

    it('create - generates schema with excluded properties', () => {
      const requestBodySpec = {
        description: 'Create a product',
        required: true,
      };

      const excludeOptions = {
        [TS_TYPE_KEY]: Product,
        schemaName: 'ProductWithoutID',
        exclude: ['id']
      }

      class MyController1 {
        @post('/Product')
        create(@newRequestBody1(
          requestBodySpec,
          excludeOptions
        ) product: Exclude<Product, ['id']>) { }
      }

      const spec1 = getControllerSpec(MyController1)

      const requestBodySpecForCreate = spec1.paths[
        '/Product'
      ]['post'].requestBody;

      const referenceSchema = spec1.components!.schemas!.ProductWithoutID;

      expect(requestBodySpecForCreate).to.have.properties({
        description: 'Create a product',
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ProductWithoutID'
            }
          }
        }
      });

      // The feature that generates schemas according to
      // different options is TO BE DONE and out of the
      // scope of this spike, so that the schema `PartialProduct`
      // here is still the same as `Product`
      expect(referenceSchema).to.have.properties({
        title: 'ProductWithoutID',
        properties: {
          categoryId: { type: 'number' },
          name: { type: 'string' }
        }
      });
    })

    it('update - generates schema with partial properties', () => {
      const requestSpecForUpdate = {
        description: 'Update a product',
        required: true,
      };

      const partialOptions = {
        [TS_TYPE_KEY]: Product,
        schemaName: 'PartialProduct',
        partial: true
      }

      class MyController2 {
        @put('/Product')
        update(@newRequestBody1(
          requestSpecForUpdate,
          partialOptions
        ) product: Partial<Product>) { }
      }

      const spec2 = getControllerSpec(MyController2)

      const requestBodySpecForCreate = spec2.paths[
        '/Product'
      ]['put'].requestBody;

      const referenceSchema = spec2.components!.schemas!.PartialProduct;

      expect(requestBodySpecForCreate).to.have.properties({
        description: 'Update a product',
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/PartialProduct'
            }
          }
        }
      });

      // The feature that generates schemas according to
      // different options is TO BE DONE and out of the
      // scope of this spike, so that the schema `PartialProduct`
      // here is still the same as `Product`
      expect(referenceSchema).to.have.properties({
        title: 'PartialProduct',
        properties: {
          categoryId: { type: 'number' },
          name: { type: 'string' }
        }
      });
    });
  });
});
