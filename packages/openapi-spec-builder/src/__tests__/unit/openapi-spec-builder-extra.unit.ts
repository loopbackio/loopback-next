// Copyright IBM Corp. and LoopBack contributors 2025. All Rights Reserved.
// Node module: @loopback/openapi-spec-builder
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  aComponentsSpec,
  anOpenApiSpec,
  anOperationSpec,
  OperationSpecBuilder,
} from '../../openapi-spec-builder';

describe('OpenAPI Spec Builder (additional coverage)', () => {
  describe('BuilderBase#withExtension()', () => {
    it('throws when the key does not start with "x-"', () => {
      expect(() =>
        anOperationSpec().withExtension('invalid-key', 'value'),
      ).to.throwError(/invalid extension.*invalid-key/i);
    });
  });

  describe('OpenApiSpecBuilder#withOperation()', () => {
    it('accepts an OperationSpecBuilder and calls build() on it', () => {
      const opBuilder = anOperationSpec().withOperationName('greet');
      const spec = anOpenApiSpec()
        .withOperation('get', '/greet', opBuilder)
        .build();

      expect(spec.paths['/greet'].get).to.containEql({
        'x-operation-name': 'greet',
      });
    });

    it('adds a second verb on an existing path without overwriting the first', () => {
      const spec = anOpenApiSpec()
        .withOperation('get', '/items', anOperationSpec().build())
        .withOperation('post', '/items', anOperationSpec().build())
        .build();

      expect(spec.paths['/items']).to.have.properties(['get', 'post']);
    });
  });

  describe('OpenApiSpecBuilder#withOperationReturningString()', () => {
    it('adds a string-response operation without an operation name', () => {
      const spec = anOpenApiSpec()
        .withOperationReturningString('get', '/hello')
        .build();

      expect(spec.paths['/hello'].get.responses['200']).to.containEql({
        description: 'The string result.',
      });
      expect(spec.paths['/hello'].get['x-operation-name']).to.be.undefined();
    });

    it('adds a string-response operation with an operation name', () => {
      const spec = anOpenApiSpec()
        .withOperationReturningString('get', '/hello', 'hello')
        .build();

      expect(spec.paths['/hello'].get['x-operation-name']).to.equal('hello');
    });
  });

  describe('OpenApiSpecBuilder#withComponents()', () => {
    it('accepts a ComponentsSpecBuilder and calls build() on it', () => {
      const builder = aComponentsSpec().withSchema('Product', {type: 'object'});
      const spec = anOpenApiSpec().withComponents(builder).build();

      expect(spec.components!.schemas).to.containEql({
        Product: {type: 'object'},
      });
    });

    it('does not overwrite existing components on a second call', () => {
      const first = aComponentsSpec().withSchema('A', {type: 'string'});
      const second = aComponentsSpec().withSchema('B', {type: 'number'});
      const spec = anOpenApiSpec()
        .withComponents(first)
        .withComponents(second)
        .build();

      // First assignment wins (??= semantics)
      expect(spec.components!.schemas).to.have.property('A');
      expect(spec.components!.schemas).to.not.have.property('B');
    });
  });

  describe('OperationSpecBuilder#withRequestBody()', () => {
    it('sets the requestBody on the operation spec', () => {
      const requestBody = {content: {'application/json': {}}};
      const spec = anOperationSpec().withRequestBody(requestBody).build();

      expect(spec.requestBody).to.deepEqual(requestBody);
    });
  });

  describe('OperationSpecBuilder#withStringResponse()', () => {
    it('uses status 200 as the default when no status is provided', () => {
      const spec = anOperationSpec().withStringResponse().build();

      expect(spec.responses['200']).to.containEql({
        description: 'The string result.',
      });
    });
  });

  describe('OperationSpecBuilder#setupOperationId()', () => {
    it('does not overwrite an existing operationId when controller name is set later', () => {
      const spec = anOperationSpec()
        .withOperationId('my.custom.id')
        .withControllerName('MyController')
        .withOperationName('myOp')
        .build();

      // operationId was already set — setupOperationId should be a no-op
      expect(spec.operationId).to.equal('my.custom.id');
    });
  });

  describe('OperationSpecBuilder#withParameter()', () => {
    it('appends to an existing parameters list on multiple calls', () => {
      const p1 = {name: 'id', in: 'path' as const};
      const p2 = {name: 'filter', in: 'query' as const};
      const p3 = {name: 'token', in: 'header' as const};

      const spec = anOperationSpec()
        .withParameter(p1)
        .withParameter(p2, p3)
        .build();

      expect(spec.parameters).to.deepEqual([p1, p2, p3]);
    });
  });

  describe('OperationSpecBuilder as OperationSpecBuilder instance check', () => {
    it('is an instance of OperationSpecBuilder', () => {
      expect(anOperationSpec()).to.be.instanceOf(OperationSpecBuilder);
    });
  });

  describe('ComponentsSpecBuilder — second call reuses existing sub-object (??= branch)', () => {
    it('accumulates schemas across multiple withSchema calls', () => {
      const spec = aComponentsSpec()
        .withSchema('A', {type: 'string'})
        .withSchema('B', {type: 'number'})
        .build();
      expect(spec.schemas).to.have.properties(['A', 'B']);
    });

    it('accumulates responses across multiple withResponse calls', () => {
      const spec = aComponentsSpec()
        .withResponse('R1', {description: 'first'})
        .withResponse('R2', {description: 'second'})
        .build();
      expect(spec.responses).to.have.properties(['R1', 'R2']);
    });

    it('accumulates parameters across multiple withParameter calls', () => {
      const spec = aComponentsSpec()
        .withParameter('P1', {name: 'p1', in: 'query'})
        .withParameter('P2', {name: 'p2', in: 'header'})
        .build();
      expect(spec.parameters).to.have.properties(['P1', 'P2']);
    });

    it('accumulates examples across multiple withExample calls', () => {
      const spec = aComponentsSpec()
        .withExample('E1', {summary: 'first'})
        .withExample('E2', {summary: 'second'})
        .build();
      expect(spec.examples).to.have.properties(['E1', 'E2']);
    });

    it('accumulates requestBodies across multiple withRequestBody calls', () => {
      const spec = aComponentsSpec()
        .withRequestBody('RB1', {content: {'application/json': {}}})
        .withRequestBody('RB2', {content: {'text/plain': {}}})
        .build();
      expect(spec.requestBodies).to.have.properties(['RB1', 'RB2']);
    });

    it('accumulates headers across multiple withHeader calls', () => {
      const spec = aComponentsSpec()
        .withHeader('H1', {description: 'first'})
        .withHeader('H2', {description: 'second'})
        .build();
      expect(spec.headers).to.have.properties(['H1', 'H2']);
    });

    it('accumulates securitySchemes across multiple withSecurityScheme calls', () => {
      const spec = aComponentsSpec()
        .withSecurityScheme('SS1', {type: 'http', scheme: 'bearer'})
        .withSecurityScheme('SS2', {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        })
        .build();
      expect(spec.securitySchemes).to.have.properties(['SS1', 'SS2']);
    });

    it('accumulates links across multiple withLink calls', () => {
      const spec = aComponentsSpec()
        .withLink('L1', {description: 'first'})
        .withLink('L2', {description: 'second'})
        .build();
      expect(spec.links).to.have.properties(['L1', 'L2']);
    });

    it('accumulates callbacks across multiple withCallback calls', () => {
      const spec = aComponentsSpec()
        .withCallback('CB1', {})
        .withCallback('CB2', {})
        .build();
      expect(spec.callbacks).to.have.properties(['CB1', 'CB2']);
    });
  });

  describe('OperationSpecBuilder — second withParameter call reuses existing array', () => {
    it('appends to the existing parameters array on the second call', () => {
      const p1 = {name: 'a', in: 'query' as const};
      const p2 = {name: 'b', in: 'query' as const};
      const spec = anOperationSpec()
        .withParameter(p1)
        .withParameter(p2)
        .build();
      expect(spec.parameters).to.deepEqual([p1, p2]);
    });
  });

  describe('OpenApiSpecBuilder — second withOperation on an existing path', () => {
    it('reuses the existing path object for a second verb', () => {
      const spec = anOpenApiSpec()
        .withOperation('get', '/things', anOperationSpec().build())
        .withOperation('delete', '/things', anOperationSpec().build())
        .build();
      expect(spec.paths['/things']).to.have.properties(['get', 'delete']);
    });
  });
});
