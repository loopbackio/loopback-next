// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {get, api} from '../../..';
import {expect} from '@loopback/testlab';
import {anOpenApiSpec, anOperationSpec} from '@loopback/openapi-spec-builder';
import {getApiSpec} from '../../../src/router/metadata';

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

  it('returns spec defined via method decorators', () => {
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

    expect(actualSpec.paths['/name']['get'])
      .to.have.property('x-operation-name', 'getChildName');
  });
});
