// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {anOpenApiSpec} from '@loopback/openapi-spec-builder';
import {expect} from '@loopback/testlab';
import {api, get, getControllerSpec, oas} from '../../..';

describe('@oas.tags decorator', () => {
  context('Without a top-level @api definition', () => {
    it('Allows a class to not be decorated with @oas.tags at all', () => {
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
      expect(actualSpec.paths['/greet'].get.tags).to.be.undefined();
    });

    it('Allows a class to decorate methods with @oas.tags', () => {
      @oas.tags('Foo', 'Bar')
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
      expect(actualSpec.paths['/greet'].get.tags).to.eql(['Foo', 'Bar']);
      expect(actualSpec.paths['/echo'].get.tags).to.eql(['Foo', 'Bar']);
    });

    it('Allows @oas.tags with options to append', () => {
      @oas.tags('Foo')
      class MyController {
        @get('/greet')
        greet() {
          return 'Hello world!';
        }

        @get('/echo')
        @oas.tags('Bar')
        echo() {
          return 'Hello world!';
        }
      }

      const actualSpec = getControllerSpec(MyController);
      expect(actualSpec.paths['/greet'].get.tags).to.eql(['Foo']);
      expect(actualSpec.paths['/echo'].get.tags).to.eql(['Foo', 'Bar']);
    });

    it('Does not allow a member variable to be decorated', () => {
      const shouldThrow = () => {
        class MyController {
          @oas.tags('foo', 'bar')
          public foo: string;

          @get('/greet')
          greet() {}
        }

        return getControllerSpec(MyController);
      };

      expect(shouldThrow).to.throw(/^\@oas.tags cannot be used on a property:/);
    });
  });
  context('With a top-level @api definition', () => {
    const expectedSpec = anOpenApiSpec()
      .withOperationReturningString('get', '/greet', 'greet')
      .build();
    expectedSpec.paths['/greet'].get.tags = ['Bin', 'Fill'];

    it('Allows a class to not be decorated with @oas.tags at all', () => {
      @api(expectedSpec)
      class MyController {
        greet() {
          return 'Hello world!';
        }

        echo() {
          return 'Hello world!';
        }
      }

      const actualSpec = getControllerSpec(MyController);
      expect(actualSpec.paths['/greet'].get.tags).to.eql(['Bin', 'Fill']);
    });

    it('Allows a class to decorate methods with @oas.tags', () => {
      @api(expectedSpec)
      @oas.tags('Foo', 'Bar')
      class MyController {
        greet() {
          return 'Hello world!';
        }
      }

      const actualSpec = getControllerSpec(MyController);
      expect(actualSpec.paths['/greet'].get.tags).to.containDeep([
        'Foo',
        'Bar',
        'Bin',
        'Fill',
      ]);
    });
  });

  it('Does not allow a member variable to be decorated', () => {
    const shouldThrow = () => {
      class MyController {
        @oas.tags('foo', 'bar')
        public foo: string;

        @get('/greet')
        greet() {}
      }

      return getControllerSpec(MyController);
    };

    expect(shouldThrow).to.throw(/^\@oas.tags cannot be used on a property:/);
  });
});
