// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, model, property, Value} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import * as Ajv from 'ajv';
import {JSONSchema6Definition} from 'json-schema';
import {JsonSchema, modelToJsonSchema} from '../..';

describe('build-schema', () => {
  describe('modelToJsonSchema', () => {
    it('converts basic model', () => {
      @model()
      class TestModel {
        @property()
        foo: string;
      }

      const jsonSchema = modelToJsonSchema(TestModel);
      expectValidJsonSchema(jsonSchema);
      expect(jsonSchema.properties).to.containDeep({
        foo: <JSONSchema6Definition>{
          type: 'string',
        },
      });
    });
  });

  describe('it converts relation link', () => {
    it('converts basic model', () => {
      @model()
      class Product extends Entity {
        constructor(data: Partial<Product>) {
          super(data);
        }

        @property({id: true})
        id: number;

        @property()
        name: string;
      }

      @model()
      class Category extends Entity {
        constructor(data: Partial<Category>) {
          super(data);
        }

        @property({id: true})
        id: number;

        @property()
        name: string;
      }

      @model()
      class ProductQueryResult extends Product {
        constructor(data: Partial<ProductQueryResult>) {
          super(data);
        }

        @property({type: () => CategoryQueryResult})
        readonly category?: Value<CategoryQueryResult>;
      }

      @model()
      class CategoryQueryResult extends Category {
        constructor(data: Partial<CategoryQueryResult>) {
          super(data);
        }

        @property({type: () => ProductQueryResult})
        readonly products?: Value<ProductQueryResult[]>;
      }

      const categoryResult = new CategoryQueryResult({
        name: 'stationery',
        products: [],
      });

      // tslint:disable-next-line:no-unused
      const productResult = new ProductQueryResult({
        name: 'pen',
        category: categoryResult,
      });

      // tslint:disable-next-line:no-unused
      const dummyCompilerCheck = productResult.category!.products!.length;

      const jsonSchema = modelToJsonSchema(ProductQueryResult);
      console.log(jsonSchema);
      expectValidJsonSchema(jsonSchema);
      expect(jsonSchema).to.deepEqual({
        title: 'ProductQueryResult',
        properties: {
          // TODO(bajtos): inherit these properties from Product schema
          // See https://swagger.io/docs/specification/data-models/inheritance-and-polymorphism/
          id: {type: 'number'},
          name: {type: 'string'},
          category: {$ref: '#/definitions/CategoryQueryResult'},
        },
        definitions: {
          CategoryQueryResult: {
            title: 'CategoryQueryResult',
            properties: [Object],
          },
        },
      });
    });
  });
});

function expectValidJsonSchema(schema: JsonSchema) {
  const ajv = new Ajv();
  const validate = ajv.compile(
    require('ajv/lib/refs/json-schema-draft-06.json'),
  );
  const isValid = validate(schema);
  const result = isValid
    ? 'JSON Schema is valid'
    : ajv.errorsText(validate.errors!);
  expect(result).to.equal('JSON Schema is valid');
}
