// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {anOpenApiSpec} from '@loopback/openapi-spec-builder';
import {expect} from '@loopback/testlab';
import {getControllerSpec} from '../../..';
import {api, deprecated, get} from '../../../decorators';

describe('deprecation decorator', () => {
  it('Returns a spec with all the items decorated from the class level', () => {
    const expectedSpec = anOpenApiSpec()
      .withOperationReturningString('get', '/greet', 'greet')
      .withOperationReturningString('get', '/echo', 'echo')
      .build();

    @api(expectedSpec)
    @deprecated()
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
      @deprecated()
      echo() {
        return 'Hello world!';
      }
    }

    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec.paths['/greet'].get.deprecated).to.be.undefined();
    expect(actualSpec.paths['/echo'].get.deprecated).to.eql(true);
  });

  it('Allows a method to override the deprecation of a class', () => {
    @deprecated()
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
      @deprecated(false)
      yell() {
        return 'HELLO WORLD!';
      }
    }
    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec.paths['/greet'].get.deprecated).to.eql(true);
    expect(actualSpec.paths['/echo'].get.deprecated).to.eql(true);
    expect(actualSpec.paths['/yell'].get.deprecated).to.be.undefined();
  });

  it('Allows a class to not be decorated with @deprecated at all', () => {
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
});
