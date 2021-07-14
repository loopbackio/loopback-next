// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {anOpenApiSpec} from '@loopback/openapi-spec-builder';
import {expect} from '@loopback/testlab';
import {api, get, getControllerSpec, oas} from '../../..';

describe('deprecation decorator', () => {
  it('Returns a spec with all the items decorated from the class level', () => {
    const expectedSpec = anOpenApiSpec()
      .withOperationReturningString('get', '/greet', 'greet')
      .withOperationReturningString('get', '/echo', 'echo')
      .build();

    @api(expectedSpec)
    @oas.deprecated()
    class MyController {
      greet() {
        return 'Hello world!';
      }
      echo() {
        return 'Hello world!';
      }
    }

    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec.paths['/greet'].get.deprecated).to.eql(true);
    expect(actualSpec.paths['/echo'].get.deprecated).to.eql(true);
  });

  it('Returns a spec where only one method is deprecated', () => {
    class MyController {
      @get('/greet')
      greet() {
        return 'Hello world!';
      }

      @get('/echo')
      @oas.deprecated()
      echo() {
        return 'Hello world!';
      }
    }

    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec.paths['/greet'].get.deprecated).to.be.undefined();
    expect(actualSpec.paths['/echo'].get.deprecated).to.eql(true);
  });

  it('Allows a method to override the deprecation of a class', () => {
    @oas.deprecated()
    class MyController {
      @get('/greet')
      greet() {
        return 'Hello world!';
      }

      @get('/echo')
      echo() {
        return 'Hello world!';
      }

      @get('/yell')
      @oas.deprecated(false)
      yell() {
        return 'HELLO WORLD!';
      }
    }
    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec.paths['/greet'].get.deprecated).to.eql(true);
    expect(actualSpec.paths['/echo'].get.deprecated).to.eql(true);
    expect(actualSpec.paths['/yell'].get.deprecated).to.be.undefined();
  });

  it('Allows a class to not be decorated with @oas.deprecated at all', () => {
    class MyController {
      @get('/greet')
      greet() {
        return 'Hello world!';
      }

      @get('/echo')
      echo() {
        return 'Hello world!';
      }
    }

    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec.paths['/greet'].get.deprecated).to.be.undefined();
    expect(actualSpec.paths['/echo'].get.deprecated).to.be.undefined();
  });

  it('Does not allow a member variable to be decorated', () => {
    const shouldThrow = () => {
      class MyController {
        @oas.deprecated()
        public foo: string;

        @get('/greet')
        greet() {}
      }

      return getControllerSpec(MyController);
    };

    expect(shouldThrow).to.throw(
      /^\@oas.deprecated cannot be used on a property:/,
    );
  });
});
