// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {anOpenApiSpec} from '@loopback/openapi-spec-builder';
import {expect} from '@loopback/testlab';
import {api, get, getControllerSpec, oas, OperationVisibility} from '../../..';

/**
 * Verification of the Controller Spec uses string literals (e.g.
 * 'documented', 'undocumented') instead of the `OperationVisibility` enum so
 * as to verify that the enum itself did not change.
 */
describe('visibility decorator', () => {
  it('Returns a spec with all the items decorated from the class level', () => {
    const expectedSpec = anOpenApiSpec()
      .withOperationReturningString('get', '/greet', 'greet')
      .withOperationReturningString('get', '/echo', 'echo')
      .build();

    @api(expectedSpec)
    @oas.visibility(OperationVisibility.UNDOCUMENTED)
    class MyController {
      greet() {
        return 'Hello world!';
      }
      echo() {
        return 'Hello world!';
      }
    }

    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec.paths['/greet'].get['x-visibility']).to.eql(
      'undocumented',
    );
    expect(actualSpec.paths['/echo'].get['x-visibility']).to.eql(
      'undocumented',
    );
  });

  it('Returns a spec where only one method is undocumented', () => {
    class MyController {
      @get('/greet')
      greet() {
        return 'Hello world!';
      }

      @get('/echo')
      @oas.visibility(OperationVisibility.UNDOCUMENTED)
      echo() {
        return 'Hello world!';
      }
    }

    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec.paths['/greet'].get['x-visibility']).to.be.undefined();
    expect(actualSpec.paths['/echo'].get['x-visibility']).to.eql(
      'undocumented',
    );
  });

  it('Allows a method to override the visibility of a class', () => {
    @oas.visibility(OperationVisibility.UNDOCUMENTED)
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
      @oas.visibility(OperationVisibility.DOCUMENTED)
      yell() {
        return 'HELLO WORLD!';
      }
    }
    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec.paths['/greet'].get['x-visibility']).to.eql(
      'undocumented',
    );
    expect(actualSpec.paths['/echo'].get['x-visibility']).to.eql(
      'undocumented',
    );
    expect(actualSpec.paths['/yell'].get['x-visibility']).to.be.eql(
      'documented',
    );
  });

  it('Allows a class to not be decorated with @oas.visibility at all', () => {
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
    expect(actualSpec.paths['/greet'].get['x-visibility']).to.be.undefined();
    expect(actualSpec.paths['/echo'].get['x-visibility']).to.be.undefined();
  });

  it('Does not allow a member variable to be decorated', () => {
    const shouldThrow = () => {
      class MyController {
        @oas.visibility(OperationVisibility.UNDOCUMENTED)
        public foo: string;

        @get('/greet')
        greet() {}
      }

      return getControllerSpec(MyController);
    };

    expect(shouldThrow).to.throw(
      /^\@oas.visibility cannot be used on a property:/,
    );
  });
});
