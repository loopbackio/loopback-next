// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-spec-builder
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {ParameterObject} from 'openapi3-ts';
import {anOpenApiSpec, anOperationSpec} from '../../openapi-spec-builder';

describe('OpenAPI Spec Builder', () => {
  describe('anOpenApiSpec', () => {
    it('creates an empty spec', () => {
      const spec = anOpenApiSpec().build();
      expect(spec).to.eql({
        openapi: '3.0.0',
        info: {
          title: 'LoopBack Application',
          version: '1.0.0',
        },
        paths: {},
        servers: [{url: '/'}],
      });
    });

    it('adds an extension', () => {
      const spec = anOpenApiSpec()
        .withExtension('x-loopback-version', '4.0')
        .build();
      expect(spec).to.containEql({'x-loopback-version': '4.0'});
    });

    it('adds an operation', () => {
      const opSpec = anOperationSpec().build();
      const spec = anOpenApiSpec()
        .withOperation('get', '/users', opSpec)
        .build();
      expect(spec.paths).to.containEql({
        '/users': {
          get: opSpec,
        },
      });
    });
  });

  describe('anOperationSpec', () => {
    it('creates an empty spec', () => {
      const spec = anOperationSpec().build();
      expect(spec).to.eql({
        responses: {'200': {description: 'An undocumented response body.'}},
      });
    });

    it('adds an extension', () => {
      const spec = anOperationSpec()
        .withExtension('x-loopback-authentication', 'oAuth2')
        .build();
      expect(spec).to.containEql({'x-loopback-authentication': 'oAuth2'});
    });

    it('sets controller name', () => {
      const spec = anOperationSpec()
        .withControllerName('MyController')
        .build();
      expect(spec).to.containEql({'x-controller-name': 'MyController'});
    });

    it('sets operation name', () => {
      const spec = anOperationSpec()
        .withOperationName('greet')
        .build();
      expect(spec).to.containEql({'x-operation-name': 'greet'});
    });

    it('sets operationId', () => {
      const spec = anOperationSpec()
        .withOperationId('MyController.greet')
        .build();
      expect(spec).to.containEql({operationId: 'MyController.greet'});
    });

    it('sets operationId from controller/operation name', () => {
      const spec = anOperationSpec()
        .withControllerName('MyController')
        .withOperationName('greet')
        .build();
      expect(spec).to.containEql({operationId: 'MyController.greet'});
    });

    it('does not set operationId without operation name', () => {
      const spec = anOperationSpec()
        .withControllerName('MyController')
        .build();
      expect(spec.operationId).to.be.undefined();
    });

    it('does not set operationId without controller name', () => {
      const spec = anOperationSpec()
        .withOperationName('greet')
        .build();
      expect(spec.operationId).to.be.undefined();
    });

    it('sets tags', () => {
      const spec = anOperationSpec()
        .withTags('loopback')
        .withTags(['customer'])
        .build();
      expect(spec.tags).to.eql(['loopback', 'customer']);
    });

    it('sets response', () => {
      const spec = anOperationSpec()
        .withResponse(200, {description: 'My response'})
        .build();
      expect(spec.responses).to.eql({'200': {description: 'My response'}});
    });

    it('sets string response', () => {
      const spec = anOperationSpec()
        .withStringResponse(200)
        .build();
      expect(spec.responses).to.eql({
        '200': {
          description: 'The string result.',
          content: {
            'text/plain': {
              schema: {type: 'string'},
            },
          },
        },
      });
    });

    it('sets parameters', () => {
      const apiKey: ParameterObject = {
        name: 'apiKey',
        in: 'header',
        schema: {type: 'string'},
      };
      const limit: ParameterObject = {
        name: 'limit',
        in: 'query',
        schema: {type: 'number'},
      };
      const spec = anOperationSpec()
        .withParameter(apiKey, limit)
        .build();
      expect(spec.parameters).to.eql([apiKey, limit]);
    });
  });
});
