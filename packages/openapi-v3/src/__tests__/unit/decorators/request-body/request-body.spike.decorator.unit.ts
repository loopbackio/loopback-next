// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  belongsTo,
  Entity,
  hasMany,
  model,
  property,
} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {getControllerSpec, post, put} from '../../../..';
import {requestBody2} from '../../../../decorators/request-body.spike.decorator';

describe('spike - requestBody decorator', () => {
  context('CRUD', () => {
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
      class MyController1 {
        @post('/Product')
        create(
          @requestBody2(
            {description: 'Create a product', required: true},
            Product,
            {exclude: ['id']},
          )
          product: Exclude<Product, ['id']>,
        ) {}
      }

      const spec1 = getControllerSpec(MyController1);

      const requestBodySpecForCreate =
        spec1.paths['/Product']['post'].requestBody;

      const referenceSchema = spec1.components!.schemas![
        'ProductExcluding[id]'
      ];

      expect(requestBodySpecForCreate).to.have.properties({
        description: 'Create a product',
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ProductExcluding[id]',
            },
          },
        },
      });

      // The feature that generates schemas according to
      // different options is TO BE DONE and out of the
      // scope of this spike, so that the schema `PartialProduct`
      // here is still the same as `Product`
      expect(referenceSchema).to.have.properties({
        title: 'ProductExcluding[id]',
        properties: {
          categoryId: {type: 'number'},
          name: {type: 'string'},
        },
      });
    });

    it('update - generates schema with partial properties', () => {
      class MyController2 {
        @put('/Product')
        update(
          @requestBody2(
            {description: 'Update a product', required: true},
            Product,
            {partial: true},
          )
          product: Partial<Product>,
        ) {}
      }

      const spec2 = getControllerSpec(MyController2);

      const requestBodySpecForCreate =
        spec2.paths['/Product']['put'].requestBody;

      const referenceSchema = spec2.components!.schemas!.ProductPartial;

      expect(requestBodySpecForCreate).to.have.properties({
        description: 'Update a product',
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ProductPartial',
            },
          },
        },
      });

      // The feature that generates schemas according to
      // different options is TO BE DONE and out of the
      // scope of this spike, so that the schema `PartialProduct`
      // here is still the same as `Product`
      expect(referenceSchema).to.have.properties({
        title: 'ProductPartial',
        properties: {
          categoryId: {type: 'number'},
          name: {type: 'string'},
        },
      });
    });
  });
  context(
    'different signatures(More tests TBD in the real implementation)',
    () => {
      @model()
      class Test extends Entity {
        @property({
          type: 'string',
        })
        name: string;
        constructor(data?: Partial<Test>) {
          super(data);
        }
      }
      it('default', () => {
        class TestController {
          @post('/Test')
          create(@requestBody2() test: Test) {}
        }

        const testSpec1 = getControllerSpec(TestController);

        const requestBodySpecForCreate =
          testSpec1.paths['/Test']['post'].requestBody;
        expect(requestBodySpecForCreate).to.have.properties({
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Test',
              },
            },
          },
        });

        const referenceSchema = testSpec1.components!.schemas!.Test;
        expect(referenceSchema).to.have.properties({
          title: 'Test',
          properties: {
            name: {type: 'string'},
          },
        });
      });
      it('omits the 1st parameter', () => {
        class TestController {
          @post('/Test')
          create(@requestBody2(Test, {partial: true}) test: Partial<Test>) {}
        }

        const testSpec1 = getControllerSpec(TestController);

        const requestBodySpecForCreate =
          testSpec1.paths['/Test']['post'].requestBody;
        expect(requestBodySpecForCreate).to.have.properties({
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TestPartial',
              },
            },
          },
        });

        const referenceSchema = testSpec1.components!.schemas!.TestPartial;
        expect(referenceSchema).to.have.properties({
          title: 'TestPartial',
          properties: {
            name: {type: 'string'},
          },
        });
      });
    },
  );
});
