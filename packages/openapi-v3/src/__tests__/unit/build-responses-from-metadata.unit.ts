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

describe('build-responses-from-metadata', () => {
  @model()
  class TestModel extends Model {
    @property()
    id: number;
    @property()
    name: string;
  }

  @model()
  class AnotherModel extends Model {
    @property()
    value: string;
  }

  describe('buildResponsesFromMetadata', () => {
    it('builds a simple response with a model', () => {
      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: TestModel,
          description: 'Success response',
        },
      ];

      const result = buildResponsesFromMetadata(metadata);

      expect(result.responses).to.eql({
        '200': {
          description: 'Success response',
          content: {
            'application/json': {
              schema: {'x-ts-type': TestModel},
            },
          },
        },
      });
    });

    it('builds a response with a schema object', () => {
      const schema: SchemaObject = {
        type: 'object',
        properties: {
          message: {type: 'string'},
        },
      };

      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: schema,
          description: 'Success response',
        },
      ];

      const result = buildResponsesFromMetadata(metadata);

      expect(result.responses).to.eql({
        '200': {
          description: 'Success response',
          content: {
            'application/json': {
              schema: schema,
            },
          },
        },
      });
    });

    it('builds multiple responses with different status codes', () => {
      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: TestModel,
          description: 'Success response',
        },
        {
          responseCode: 404,
          contentType: 'application/json',
          responseModelOrSpec: {type: 'object'},
          description: 'Not found',
        },
      ];

      const result = buildResponsesFromMetadata(metadata);

      expect(result.responses).to.have.keys('200', '404');
      expect(result.responses['200'].description).to.equal('Success response');
      expect(result.responses['404'].description).to.equal('Not found');
    });

    it('builds response with multiple content types', () => {
      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: TestModel,
          description: 'Success response',
        },
        {
          responseCode: 200,
          contentType: 'application/xml',
          responseModelOrSpec: TestModel,
          description: 'Success response',
        },
      ];

      const result = buildResponsesFromMetadata(metadata);

      expect(result.responses['200'].content).to.have.keys(
        'application/json',
        'application/xml',
      );
    });

    it('builds response with multiple models for same content type using anyOf', () => {
      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: TestModel,
          description: 'Success response',
        },
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: AnotherModel,
          description: 'Success response',
        },
      ];

      const result = buildResponsesFromMetadata(metadata);

      expect(result.responses['200'].content['application/json'].schema).to.eql(
        {
          anyOf: [{'x-ts-type': TestModel}, {'x-ts-type': AnotherModel}],
        },
      );
    });

    it('builds response with multiple schema objects using anyOf', () => {
      const schema1: SchemaObject = {type: 'string'};
      const schema2: SchemaObject = {type: 'number'};

      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: schema1,
          description: 'Success response',
        },
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: schema2,
          description: 'Success response',
        },
      ];

      const result = buildResponsesFromMetadata(metadata);

      expect(result.responses['200'].content['application/json'].schema).to.eql(
        {
          anyOf: [schema1, schema2],
        },
      );
    });

    it('merges with existing operation responses', () => {
      const existingOperation: OperationObject = {
        responses: {
          '200': {
            description: 'Existing response',
            content: {
              'text/plain': {
                schema: {type: 'string'},
              },
            },
          },
        },
      };

      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: TestModel,
          description: 'New response',
        },
      ];

      const result = buildResponsesFromMetadata(metadata, existingOperation);

      expect(result.responses['200'].description).to.equal('New response');
      expect(result.responses['200'].content).to.have.keys(
        'text/plain',
        'application/json',
      );
    });

    it('handles empty metadata array', () => {
      const metadata: ResponseDecoratorMetadata = [];

      const result = buildResponsesFromMetadata(metadata);

      expect(result.responses).to.eql({});
    });

    it('preserves existing responses for different status codes', () => {
      const existingOperation: OperationObject = {
        responses: {
          '404': {
            description: 'Not found',
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
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: TestModel,
          description: 'Success',
        },
      ];

      const result = buildResponsesFromMetadata(metadata, existingOperation);

      expect(result.responses).to.have.keys('200', '404');
      expect(result.responses['404'].description).to.equal('Not found');
    });

    it('handles class decorated with @model but not extending Model', () => {
      @model()
      class CustomClass {
        @property()
        value: string;
      }

      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: CustomClass,
          description: 'Success',
        },
      ];

      const result = buildResponsesFromMetadata(metadata);

      expect(result.responses['200'].content['application/json'].schema).to.eql(
        {
          'x-ts-type': CustomClass,
        },
      );
    });

    it('handles mixed models and schemas in anyOf', () => {
      const schema: SchemaObject = {type: 'string'};

      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: TestModel,
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

      expect(result.responses['200'].content['application/json'].schema).to.eql(
        {
          anyOf: [{'x-ts-type': TestModel}, schema],
        },
      );
    });

    it('handles multiple status codes with multiple content types', () => {
      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: TestModel,
          description: 'Success',
        },
        {
          responseCode: 200,
          contentType: 'application/xml',
          responseModelOrSpec: TestModel,
          description: 'Success',
        },
        {
          responseCode: 201,
          contentType: 'application/json',
          responseModelOrSpec: AnotherModel,
          description: 'Created',
        },
      ];

      const result = buildResponsesFromMetadata(metadata);

      expect(result.responses).to.have.keys('200', '201');
      expect(result.responses['200'].content).to.have.keys(
        'application/json',
        'application/xml',
      );
      expect(result.responses['201'].content).to.have.keys('application/json');
    });

    it('updates description when merging same status code', () => {
      const existingOperation: OperationObject = {
        responses: {
          '200': {
            description: 'Old description',
            content: {
              'text/plain': {
                schema: {type: 'string'},
              },
            },
          },
        },
      };

      const metadata: ResponseDecoratorMetadata = [
        {
          responseCode: 200,
          contentType: 'application/json',
          responseModelOrSpec: TestModel,
          description: 'Updated description',
        },
      ];

      const result = buildResponsesFromMetadata(metadata, existingOperation);

      expect(result.responses['200'].description).to.equal(
        'Updated description',
      );
    });
  });
});

// Made with Bob
