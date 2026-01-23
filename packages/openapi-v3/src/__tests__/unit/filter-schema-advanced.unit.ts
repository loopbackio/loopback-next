// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {model, Model, property} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {getFilterSchemaFor, getWhereSchemaFor} from '../../filter-schema';

describe('filter-schema advanced tests', () => {
  @model()
  class Product extends Model {
    @property({id: true})
    id: number;

    @property({required: true})
    name: string;

    @property()
    price: number;

    @property()
    description?: string;

    @property()
    inStock: boolean;
  }

  @model()
  class Category extends Model {
    @property({id: true})
    id: number;

    @property()
    title: string;

    @property.array(String)
    tags: string[];
  }

  @model()
  class Order extends Model {
    @property({id: true})
    id: number;

    @property()
    customerId: number;

    @property()
    orderDate: Date;

    @property()
    total: number;
  }

  describe('getFilterSchemaFor', () => {
    it('generates filter schema for a model', () => {
      const schema = getFilterSchemaFor(Product);
      expect(schema).to.have.property('type', 'object');
      expect(schema).to.have.property('properties');
      expect(schema).to.have.property('x-typescript-type');
      expect(schema['x-typescript-type']).to.equal(
        '@loopback/repository#Filter<Product>',
      );
    });

    it('includes standard filter properties', () => {
      const schema = getFilterSchemaFor(Product);
      expect(schema.properties).to.have.property('where');
      expect(schema.properties).to.have.property('fields');
      expect(schema.properties).to.have.property('offset');
      expect(schema.properties).to.have.property('limit');
      expect(schema.properties).to.have.property('skip');
      expect(schema.properties).to.have.property('order');
    });

    it('generates filter schema with exclude option', () => {
      const schema = getFilterSchemaFor(Product, {
        exclude: ['description'],
      });
      expect(schema).to.have.property('properties');
      expect(schema['x-typescript-type']).to.equal(
        '@loopback/repository#Filter<Product>',
      );
    });

    it('generates filter schema excluding specific fields', () => {
      const schema = getFilterSchemaFor(Product, {
        exclude: ['where', 'limit'],
      });
      expect(schema).to.have.property('properties');
      expect(schema.properties).to.not.have.property('where');
      expect(schema.properties).to.not.have.property('limit');
    });

    it('handles model with array properties', () => {
      const schema = getFilterSchemaFor(Category);
      expect(schema).to.have.property('properties');
      expect(schema['x-typescript-type']).to.equal(
        '@loopback/repository#Filter<Category>',
      );
    });

    it('handles model with Date properties', () => {
      const schema = getFilterSchemaFor(Order);
      expect(schema).to.have.property('properties');
      expect(schema['x-typescript-type']).to.equal(
        '@loopback/repository#Filter<Order>',
      );
    });

    it('generates schema with proper title from model name', () => {
      const schema = getFilterSchemaFor(Product);
      expect(schema).to.have.property('title');
      expect(schema.title).to.match(/Product/);
    });

    it('handles optional properties in model', () => {
      const schema = getFilterSchemaFor(Product);
      expect(schema.properties).to.have.property('where');
      // The where clause should allow filtering on optional properties
      expect(schema).to.be.ok();
    });

    it('generates different schemas for different models', () => {
      const productSchema = getFilterSchemaFor(Product);
      const categorySchema = getFilterSchemaFor(Category);

      expect(productSchema['x-typescript-type']).to.equal(
        '@loopback/repository#Filter<Product>',
      );
      expect(categorySchema['x-typescript-type']).to.equal(
        '@loopback/repository#Filter<Category>',
      );
    });

    it('includes additionalProperties setting', () => {
      const schema = getFilterSchemaFor(Product);
      // Filter schemas typically allow additional properties
      expect(schema).to.have.property('additionalProperties');
    });
  });

  describe('getWhereSchemaFor', () => {
    it('generates where schema for a model', () => {
      const schema = getWhereSchemaFor(Product);
      expect(schema).to.have.property('type', 'object');
      expect(schema).to.have.property('x-typescript-type');
      expect(schema['x-typescript-type']).to.equal(
        '@loopback/repository#Where<Product>',
      );
    });

    it('handles model with different property types', () => {
      const schema = getWhereSchemaFor(Order);
      expect(schema).to.have.property('x-typescript-type');
      expect(schema['x-typescript-type']).to.equal(
        '@loopback/repository#Where<Order>',
      );
    });

    it('generates different where schemas for different models', () => {
      const productSchema = getWhereSchemaFor(Product);
      const categorySchema = getWhereSchemaFor(Category);

      expect(productSchema['x-typescript-type']).to.equal(
        '@loopback/repository#Where<Product>',
      );
      expect(categorySchema['x-typescript-type']).to.equal(
        '@loopback/repository#Where<Category>',
      );
    });

    it('includes title in where schema', () => {
      const schema = getWhereSchemaFor(Product);
      expect(schema).to.have.property('title');
    });

    it('allows additionalProperties in where schema', () => {
      const schema = getWhereSchemaFor(Product);
      expect(schema).to.have.property('additionalProperties');
    });

    it('handles model with boolean properties', () => {
      const schema = getWhereSchemaFor(Product);
      expect(schema).to.be.ok();
      expect(schema['x-typescript-type']).to.equal(
        '@loopback/repository#Where<Product>',
      );
    });
  });

  describe('filter and where schema comparison', () => {
    it('filter schema is more comprehensive than where schema', () => {
      const filterSchema = getFilterSchemaFor(Product);
      const whereSchema = getWhereSchemaFor(Product);

      // Filter includes where plus other properties
      expect(filterSchema.properties).to.have.property('where');
      expect(filterSchema.properties).to.have.property('limit');
      expect(filterSchema.properties).to.have.property('offset');

      // Where is just the condition part
      expect(whereSchema).to.not.have.property('limit');
      expect(whereSchema).to.not.have.property('offset');
    });

    it('both schemas have x-typescript-type', () => {
      const filterSchema = getFilterSchemaFor(Product);
      const whereSchema = getWhereSchemaFor(Product);

      expect(filterSchema).to.have.property('x-typescript-type');
      expect(whereSchema).to.have.property('x-typescript-type');
      expect(filterSchema['x-typescript-type']).to.not.equal(
        whereSchema['x-typescript-type'],
      );
    });
  });

  describe('edge cases', () => {
    it('handles model with no properties', () => {
      @model()
      class EmptyModel extends Model {}

      const filterSchema = getFilterSchemaFor(EmptyModel);
      const whereSchema = getWhereSchemaFor(EmptyModel);

      expect(filterSchema).to.be.ok();
      expect(whereSchema).to.be.ok();
    });

    it('handles model with only id property', () => {
      @model()
      class IdOnlyModel extends Model {
        @property({id: true})
        id: number;
      }

      const filterSchema = getFilterSchemaFor(IdOnlyModel);
      const whereSchema = getWhereSchemaFor(IdOnlyModel);

      expect(filterSchema['x-typescript-type']).to.equal(
        '@loopback/repository#Filter<IdOnlyModel>',
      );
      expect(whereSchema['x-typescript-type']).to.equal(
        '@loopback/repository#Where<IdOnlyModel>',
      );
    });

    it('handles model with complex nested properties', () => {
      @model()
      class ComplexModel extends Model {
        @property({id: true})
        id: number;

        @property()
        metadata: object;

        @property.array(Object)
        items: object[];
      }

      const filterSchema = getFilterSchemaFor(ComplexModel);
      const whereSchema = getWhereSchemaFor(ComplexModel);

      expect(filterSchema).to.be.ok();
      expect(whereSchema).to.be.ok();
    });
  });

  describe('schema properties validation', () => {
    it('filter schema has correct property types', () => {
      const schema = getFilterSchemaFor(Product);

      expect(schema.properties?.offset).to.have.property('type');
      expect(schema.properties?.limit).to.have.property('type');
      expect(schema.properties?.skip).to.have.property('type');
    });

    it('filter schema includes fields property for projection', () => {
      const schema = getFilterSchemaFor(Product);
      expect(schema.properties).to.have.property('fields');
    });

    it('filter schema includes order property for sorting', () => {
      const schema = getFilterSchemaFor(Product);
      expect(schema.properties).to.have.property('order');
    });
  });

  describe('multiple filter options', () => {
    it('handles exclude with multiple properties', () => {
      const schema = getFilterSchemaFor(Product, {
        exclude: ['description', 'inStock'],
      });
      expect(schema).to.be.ok();
      expect(schema['x-typescript-type']).to.equal(
        '@loopback/repository#Filter<Product>',
      );
    });

    it('handles multiple exclude options', () => {
      const schema = getFilterSchemaFor(Product, {
        exclude: ['where', 'fields', 'limit'],
      });
      expect(schema).to.be.ok();
      expect(schema.properties).to.not.have.property('where');
      expect(schema.properties).to.not.have.property('fields');
      expect(schema.properties).to.not.have.property('limit');
    });
  });
});

// Made with Bob
