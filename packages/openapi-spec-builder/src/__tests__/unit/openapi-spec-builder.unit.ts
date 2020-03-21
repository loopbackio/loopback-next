// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/openapi-spec-builder
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {ParameterObject} from 'openapi3-ts';
import {
  aComponentsSpec,
  anOpenApiSpec,
  anOperationSpec,
} from '../../openapi-spec-builder';

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

    it('adds components', () => {
      const comSpec = aComponentsSpec().build();
      const spec = anOpenApiSpec().withComponents(comSpec).build();
      expect(spec.components).to.containEql(comSpec);
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
      const spec = anOperationSpec().withControllerName('MyController').build();
      expect(spec).to.containEql({'x-controller-name': 'MyController'});
    });

    it('sets operation name', () => {
      const spec = anOperationSpec().withOperationName('greet').build();
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
      const spec = anOperationSpec().withControllerName('MyController').build();
      expect(spec.operationId).to.be.undefined();
    });

    it('does not set operationId without controller name', () => {
      const spec = anOperationSpec().withOperationName('greet').build();
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
      const spec = anOperationSpec().withStringResponse(200).build();
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
      const spec = anOperationSpec().withParameter(apiKey, limit).build();
      expect(spec.parameters).to.eql([apiKey, limit]);
    });
  });

  describe('aComponentsSpec', () => {
    it('creates an empty spec', () => {
      const spec = aComponentsSpec().build();
      expect(spec).to.eql({});
    });

    it('adds a spec to schemas', () => {
      const spec = aComponentsSpec()
        .withSchema('TestSchema', {type: 'object'})
        .build();
      expect(spec.schemas).to.eql({
        TestSchema: {type: 'object'},
      });
    });

    it('adds a spec to responses', () => {
      const spec = aComponentsSpec()
        .withResponse('TestResponse', {description: 'test'})
        .build();
      expect(spec.responses).to.eql({
        TestResponse: {description: 'test'},
      });
    });

    it('adds a spec to parameters', () => {
      const spec = aComponentsSpec()
        .withParameter('TestParameter', {name: 'test', in: 'path'})
        .build();
      expect(spec.parameters).to.eql({
        TestParameter: {name: 'test', in: 'path'},
      });
    });

    it('adds a spec to examples', () => {
      const spec = aComponentsSpec()
        .withExample('TestExample', {description: 'test', anyProp: {}})
        .build();
      expect(spec.examples).to.eql({
        TestExample: {description: 'test', anyProp: {}},
      });
    });

    it('adds a spec to requestBodies', () => {
      const spec = aComponentsSpec()
        .withRequestBody('TestRequestBody', {content: {'application/json': {}}})
        .build();
      expect(spec.requestBodies).to.eql({
        TestRequestBody: {content: {'application/json': {}}},
      });
    });

    it('adds a spec to headers', () => {
      const spec = aComponentsSpec()
        .withHeader('TestHeader', {description: 'test'})
        .build();
      expect(spec.headers).to.eql({
        TestHeader: {description: 'test'},
      });
    });

    it('adds a spec to securitySchemes', () => {
      const spec = aComponentsSpec()
        .withSecurityScheme('TestSecurityScheme', {type: 'http'})
        .build();
      expect(spec.securitySchemes).to.eql({
        TestSecurityScheme: {type: 'http'},
      });
    });

    it('adds a spec to links', () => {
      const spec = aComponentsSpec()
        .withLink('TestLink', {description: 'test', anyProp: {}})
        .build();
      expect(spec.links).to.eql({
        TestLink: {description: 'test', anyProp: {}},
      });
    });

    it('adds a spec to callbacks', () => {
      const spec = aComponentsSpec()
        .withCallback('TestCallback', {anyProp: {}})
        .build();
      expect(spec.callbacks).to.eql({
        TestCallback: {anyProp: {}},
      });
    });

    it('adds an extension', () => {
      const spec = aComponentsSpec()
        .withExtension('x-loopback-test', 'test')
        .build();
      expect(spec).to.containEql({'x-loopback-test': 'test'});
    });
  });
});
