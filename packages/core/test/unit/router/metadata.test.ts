// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  get,
  api,
  param,
  ParameterObject,
  getApiSpec,
  operation,
  post,
  put,
  patch,
  del,
} from '../../..';
import {expect} from '@loopback/testlab';
import {anOpenApiSpec, anOperationSpec} from '@loopback/openapi-spec-builder';

describe('Routing metadata', () => {
  it('returns spec defined via @api()', () => {
    const expectedSpec = anOpenApiSpec()
      .withOperationReturningString('get', '/greet', 'greet')
      .build();

    @api(expectedSpec)
    class MyController {
      greet() {
        return 'Hello world!';
      }
    }

    const actualSpec = getApiSpec(MyController);
    expect(actualSpec).to.eql(expectedSpec);
  });

  it('returns spec defined via @get decorator', () => {
    const operationSpec = anOperationSpec().withStringResponse().build();

    class MyController {
      @get('/greet', operationSpec)
      greet() {
        return 'Hello world!';
      }
    }

    const actualSpec = getApiSpec(MyController);

    const expectedSpec = anOpenApiSpec()
      .withOperation(
        'get',
        '/greet',
        Object.assign({'x-operation-name': 'greet'}, operationSpec),
      )
      .build();
    expect(actualSpec).to.eql(expectedSpec);
  });

  it('returns spec defined via @post decorator', () => {
    const operationSpec = anOperationSpec().withStringResponse().build();

    class MyController {
      @post('/greeting', operationSpec)
      createGreeting() {}
    }

    const actualSpec = getApiSpec(MyController);

    const expectedSpec = anOpenApiSpec()
      .withOperation(
        'post',
        '/greeting',
        Object.assign({'x-operation-name': 'createGreeting'}, operationSpec),
      )
      .build();
    expect(actualSpec).to.eql(expectedSpec);
  });

  it('returns spec defined via @put decorator', () => {
    const operationSpec = anOperationSpec().withStringResponse().build();

    class MyController {
      @put('/greeting', operationSpec)
      updateGreeting() {}
    }

    const actualSpec = getApiSpec(MyController);

    const expectedSpec = anOpenApiSpec()
      .withOperation(
        'put',
        '/greeting',
        Object.assign({'x-operation-name': 'updateGreeting'}, operationSpec),
      )
      .build();
    expect(actualSpec).to.eql(expectedSpec);
  });

  it('returns spec defined via @patch decorator', () => {
    const operationSpec = anOperationSpec().withStringResponse().build();

    class MyController {
      @patch('/greeting', operationSpec)
      patchGreeting() {}
    }

    const actualSpec = getApiSpec(MyController);

    const expectedSpec = anOpenApiSpec()
      .withOperation(
        'patch',
        '/greeting',
        Object.assign({'x-operation-name': 'patchGreeting'}, operationSpec),
      )
      .build();
    expect(actualSpec).to.eql(expectedSpec);
  });

  it('returns spec defined via @del decorator', () => {
    const operationSpec = anOperationSpec().withStringResponse().build();

    class MyController {
      @del('/greeting', operationSpec)
      deleteGreeting() {}
    }

    const actualSpec = getApiSpec(MyController);

    const expectedSpec = anOpenApiSpec()
      .withOperation(
        'del',
        '/greeting',
        Object.assign({'x-operation-name': 'deleteGreeting'}, operationSpec),
      )
      .build();
    expect(actualSpec).to.eql(expectedSpec);
  });

  it('returns spec defined via @operation decorator', () => {
    const operationSpec = anOperationSpec().withStringResponse().build();

    class MyController {
      @operation('post', '/greeting', operationSpec)
      createGreeting() {}
    }

    const actualSpec = getApiSpec(MyController);

    const expectedSpec = anOpenApiSpec()
      .withOperation(
        'post',
        '/greeting',
        Object.assign({'x-operation-name': 'createGreeting'}, operationSpec),
      )
      .build();
    expect(actualSpec).to.eql(expectedSpec);
  });

  it('returns default spec for @get with no spec', () => {
    class MyController {
      @get('/greet')
      greet() {}
    }

    const actualSpec = getApiSpec(MyController);

    expect(actualSpec.paths['/greet']['get']).to.eql({
      'x-operation-name': 'greet',
      responses: {},
    });
  });

  it('returns default spec for @operation with no spec', () => {
    class MyController {
      @operation('post', '/greeting')
      createGreeting() {}
    }

    const actualSpec = getApiSpec(MyController);

    expect(actualSpec.paths['/greeting']['post']).to.eql({
      'x-operation-name': 'createGreeting',
      responses: {},
    });
  });

  it('honours specifications from inherited methods', () => {
    const operationSpec = anOperationSpec().withStringResponse().build();

    class Parent {
      @get('/parent', operationSpec)
      getParentName() {
        return 'The Parent';
      }
    }

    class Child extends Parent {
      @get('/child', operationSpec)
      getChildName() {
        return 'The Child';
      }
    }

    const actualSpec = getApiSpec(Child);

    const expectedSpec = anOpenApiSpec()
      .withOperation(
        'get',
        '/parent',
        Object.assign({'x-operation-name': 'getParentName'}, operationSpec),
      )
      .withOperation(
        'get',
        '/child',
        Object.assign({'x-operation-name': 'getChildName'}, operationSpec),
      )
      .build();

    expect(actualSpec).to.eql(expectedSpec);
  });

  it('allows children to override parent REST endpoints', () => {
    const operationSpec = anOperationSpec().withStringResponse().build();

    class Parent {
      @get('/name', operationSpec)
      getParentName() {
        return 'The Parent';
      }
    }

    class Child extends Parent {
      @get('/name', operationSpec)
      getChildName() {
        return 'The Child';
      }
    }

    const actualSpec = getApiSpec(Child);

    expect(actualSpec.paths['/name']['get']).to.have.property(
      'x-operation-name',
      'getChildName',
    );
  });
});
