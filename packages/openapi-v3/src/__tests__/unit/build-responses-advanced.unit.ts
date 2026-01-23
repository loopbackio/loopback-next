// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {model, Model, property} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {buildResponsesFromMetadata} from '../../build-responses-from-metadata';
import {
  OperationObject,
  ResponseDecoratorMetadata,
  SchemaObject,
} from '../../types';

describe('build-responses-from-metadata advanced tests', () => {
  @model()
  class Product extends Model {
    @property()
    id: number;
    @property()
    name: string;
    @property()
    price: number;
  }

  @model()
  class Category extends Model {
    @property()
    id: number;
    @property()
    title: string;
  }

  @model()
  class ErrorResponse extends Model {
    @property()
    code: string;
    @property()
    message: string;
  }

  describe('buildResponsesFromMetadata - multiple models', () => {
    it('builds response with multiple models using anyOf', () => {
      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: Product,
          description: 'Success',
        },
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: Category,
          description: 'Success',
        },
      ];

      const result = buildResponsesFromMetadata(metadata);

      expect(result.responses).to.have.property('200');
      expect(result.responses['200'].description).to.equal('Success');
      const schema = result.responses['200'].content['application/json'].schema;
      expect(schema).to.have.property('anyOf');
      expect(schema.anyOf).to.be.Array();
      expect(schema.anyOf).to.have.length(2);
      expect(schema.anyOf[0]).to.eql({'x-ts-type': Product});
      expect(schema.anyOf[1]).to.eql({'x-ts-type': Category});
    });

    it('builds response with three or more models', () => {
      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: Product,
          description: 'Multiple types',
        },
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: Category,
          description: 'Multiple types',
        },
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: ErrorResponse,
          description: 'Multiple types',
        },
      ];

      const result = buildResponsesFromMetadata(metadata);
      const schema = result.responses['200'].content['application/json'].schema;
      expect(schema.anyOf).to.have.length(3);
    });
  });

  describe('buildResponsesFromMetadata - multiple content types', () => {
    it('handles multiple content types for same response code', () => {
      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: Product,
          description: 'Success',
        },
        {
          responseCode: 200,
          contentType: 'application/xml',
          responseModelOrSpec: {type: 'string'},
          description: 'Success',
        },
      ];

      const result = buildResponsesFromMetadata(metadata);

      expect(result.responses['200'].content).to.have.property(
        'application/json',
      );
      expect(result.responses['200'].content).to.have.property(
        'application/xml',
      );
      expect(result.responses['200'].content['application/json'].schema).to.eql(
        {'x-ts-type': Product},
      );
      expect(result.responses['200'].content['application/xml'].schema).to.eql({
        type: 'string',
      });
    });

    it('handles text/plain and application/json', () => {
      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'text/plain',
          responseModelOrSpec: {type: 'string'},
          description: 'Plain text response',
        },
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: Product,
          description: 'JSON response',
        },
      ];

      const result = buildResponsesFromMetadata(metadata);
      expect(result.responses['200'].content).to.have.property('text/plain');
      expect(result.responses['200'].content).to.have.property(
        'application/json',
      );
    });
  });

  describe('buildResponsesFromMetadata - multiple response codes', () => {
    it('handles multiple response codes', () => {
      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: Product,
          description: 'Success',
        },
        {
          responseCode: 404,
          contentType: 'application/json',
          responseModelOrSpec: ErrorResponse,
          description: 'Not Found',
        },
        {
          responseCode: 500,
          contentType: 'application/json',
          responseModelOrSpec: ErrorResponse,
          description: 'Internal Server Error',
        },
      ];

      const result = buildResponsesFromMetadata(metadata);

      expect(result.responses).to.have.property('200');
      expect(result.responses).to.have.property('404');
      expect(result.responses).to.have.property('500');
      expect(result.responses['200'].description).to.equal('Success');
      expect(result.responses['404'].description).to.equal('Not Found');
      expect(result.responses['500'].description).to.equal(
        'Internal Server Error',
      );
    });
  });

  describe('buildResponsesFromMetadata - schema objects', () => {
    it('handles plain schema objects instead of models', () => {
      const schema: SchemaObject = {
        type: 'object',
        properties: {
          id: {type: 'number'},
          name: {type: 'string'},
        },
      };

      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: schema,
          description: 'Success with schema',
        },
      ];

      const result = buildResponsesFromMetadata(metadata);
      expect(result.responses['200'].content['application/json'].schema).to.eql(
        schema,
      );
    });

    it('handles mixed models and schemas', () => {
      const schema: SchemaObject = {
        type: 'array',
        items: {type: 'string'},
      };

      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: Product,
          description: 'Success',
        },
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: schema,
          description: 'Success',
        },
      ];

      const result = buildResponsesFromMetadata(metadata);
      const responseSchema =
        result.responses['200'].content['application/json'].schema;
      expect(responseSchema).to.have.property('anyOf');
      expect(responseSchema.anyOf).to.have.length(2);
    });
  });

  describe('buildResponsesFromMetadata - with existing operation', () => {
    it('merges with existing operation responses', () => {
      const existingOperation: OperationObject = {
        responses: {
          '200': {
            description: 'Existing response',
            content: {
              'application/json': {
                schema: {type: 'string'},
              },
            },
          },
        },
      };

      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/xml',
          responseModelOrSpec: {type: 'string'},
          description: 'Updated response',
        },
      ];

      const result = buildResponsesFromMetadata(metadata, existingOperation);

      expect(result.responses['200'].description).to.equal('Updated response');
      expect(result.responses['200'].content).to.have.property(
        'application/json',
      );
      expect(result.responses['200'].content).to.have.property(
        'application/xml',
      );
    });

    it('adds new response codes to existing operation', () => {
      const existingOperation: OperationObject = {
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {type: 'object'},
              },
            },
          },
        },
      };

      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 404,
          contentType: 'application/json',
          responseModelOrSpec: ErrorResponse,
          description: 'Not Found',
        },
      ];

      const result = buildResponsesFromMetadata(metadata, existingOperation);

      expect(result.responses).to.have.property('200');
      expect(result.responses).to.have.property('404');
      expect(result.responses['200'].description).to.equal('Success');
      expect(result.responses['404'].description).to.equal('Not Found');
    });
  });

  describe('buildResponsesFromMetadata - edge cases', () => {
    it('handles empty metadata array', () => {
      const metadata: ResponseDecoratorMetadata = [];
      const result = buildResponsesFromMetadata(metadata);
      expect(result.responses).to.eql({});
    });

    it('handles single response with single model', () => {
      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: Product,
          description: 'Single response',
        },
      ];

      const result = buildResponsesFromMetadata(metadata);
      expect(result.responses['200'].content['application/json'].schema).to.eql(
        {'x-ts-type': Product},
      );
    });

    it('handles response with reference object', () => {
      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: {$ref: '#/components/schemas/Product'},
          description: 'Reference response',
        },
      ];

      const result = buildResponsesFromMetadata(metadata);
      expect(result.responses['200'].content['application/json'].schema).to.eql(
        {$ref: '#/components/schemas/Product'},
      );
    });
  });

  describe('buildResponsesFromMetadata - complex scenarios', () => {
    it('handles multiple models for multiple content types', () => {
      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: Product,
          description: 'Success',
        },
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: Category,
          description: 'Success',
        },
        {
          responseCode: 200,
          contentType: 'application/xml',
          responseModelOrSpec: {type: 'string'},
          description: 'Success',
        },
      ];

      const result = buildResponsesFromMetadata(metadata);
      const jsonSchema =
        result.responses['200'].content['application/json'].schema;
      const xmlSchema =
        result.responses['200'].content['application/xml'].schema;

      expect(jsonSchema).to.have.property('anyOf');
      expect(jsonSchema.anyOf).to.have.length(2);
      expect(xmlSchema).to.eql({type: 'string'});
    });

    it('handles array response with model items', () => {
      const arraySchema: SchemaObject = {
        type: 'array',
        items: {'x-ts-type': Product},
      };

      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: arraySchema,
          description: 'Array of products',
        },
      ];

      const result = buildResponsesFromMetadata(metadata);
      const schema = result.responses['200'].content['application/json'].schema;
      expect(schema.type).to.equal('array');
      expect(schema.items).to.eql({'x-ts-type': Product});
    });
  });
});

// Made with Bob
