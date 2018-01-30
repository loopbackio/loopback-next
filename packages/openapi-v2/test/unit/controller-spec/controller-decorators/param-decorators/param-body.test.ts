// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v2
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {post, param, getControllerSpec} from '../../../../..';
import {expect} from '@loopback/testlab';
import {model, property} from '@loopback/repository';

describe('Routing metadata for parameters', () => {
  describe('@param.body', () => {
    it('defines a parameter with in:body', () => {
      class MyController {
        @post('/greeting')
        @param.body('data', {type: 'object'})
        greet(name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greeting']['post'].parameters).to.eql([
        {
          name: 'data',
          in: 'body',
          schema: {type: 'object'},
        },
      ]);
    });
  });

  it('infers a complex parameter type with in:body', () => {
    class MyData {
      name: string;
    }
    class MyController {
      @post('/greeting')
      greet(@param.body('data') data: MyData) {}
    }

    const actualSpec = getControllerSpec(MyController);

    expect(actualSpec.paths['/greeting']['post'].parameters).to.eql([
      {
        name: 'data',
        in: 'body',
        schema: {$ref: '#/definitions/MyData'},
      },
    ]);
  });

  it('infers a complex parameter schema with in:body', () => {
    @model()
    class MyData {
      @property() name: string;
    }
    class MyController {
      @post('/greeting')
      greet(@param.body('data') data: MyData) {}
    }

    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec.definitions).to.deepEqual({
      MyData: {
        title: 'MyData',
        properties: {
          name: {
            type: 'string',
          },
        },
      },
    });
  });

  it('infers a string parameter type with in:body', () => {
    class MyController {
      @post('/greeting')
      greet(@param.body('name') name: string) {}
    }

    const actualSpec = getControllerSpec(MyController);

    expect(actualSpec.paths['/greeting']['post'].parameters).to.eql([
      {
        name: 'name',
        in: 'body',
        schema: {
          type: 'string',
        },
      },
    ]);
  });

  it('infers a number parameter type with in:body', () => {
    class MyController {
      @post('/greeting')
      greet(@param.body('count') name: number) {}
    }

    const actualSpec = getControllerSpec(MyController);

    expect(actualSpec.paths['/greeting']['post'].parameters).to.eql([
      {
        name: 'count',
        in: 'body',
        schema: {
          type: 'number',
        },
      },
    ]);
  });

  it('infers a boolean parameter type with in:body', () => {
    class MyController {
      @post('/greeting')
      greet(@param.body('vip') vip: boolean) {}
    }

    const actualSpec = getControllerSpec(MyController);

    expect(actualSpec.paths['/greeting']['post'].parameters).to.eql([
      {
        name: 'vip',
        in: 'body',
        schema: {
          type: 'boolean',
        },
      },
    ]);
  });

  it('infers an array parameter type with in:body', () => {
    class MyController {
      @post('/greeting')
      greet(
        @param({name: 'names', in: 'body', schema: {items: {type: 'string'}}})
        names: string[],
      ) {}
    }

    const actualSpec = getControllerSpec(MyController);

    expect(actualSpec.paths['/greeting']['post'].parameters).to.eql([
      {
        name: 'names',
        in: 'body',
        schema: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    ]);
  });

  it('reports error if more than one body params are found for the same method', () => {
    class MyController {
      @post('/greeting')
      greet(
        @param.body('name', {type: 'string'})
        name: string,
        @param.body('prefix', {type: 'string'})
        prefix: string,
      ) {}
    }

    expect(() => getControllerSpec(MyController)).to.throw(
      /More than one body parameters found/,
    );
  });
});
