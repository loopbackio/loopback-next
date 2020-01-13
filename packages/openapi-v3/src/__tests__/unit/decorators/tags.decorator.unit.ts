// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {getControllerSpec} from '../../..';
import {get, tags} from '../../../decorators';

describe('@tags decorator', () => {
  it('Allows a class to not be decorated with @tags at all', () => {
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

  it('Allows a class to decorate methods with @tags', () => {
    @tags(['Foo', 'Bar'])
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

  it('Allows method @tags to override controller @tags', () => {
    @tags(['Foo', 'Bar'])
    class MyController {
      @get('/greet')
      greet() {
        return 'Hello world!';
      }

      @get('/echo')
      @tags(['Baz'])
      echo() {
        return 'Hello world!';
      }
    }

    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec.paths['/greet'].get.tags).to.eql(['Foo', 'Bar']);
    expect(actualSpec.paths['/echo'].get.tags).to.eql(['Baz']);
  });

  it('Allows @tags with options to append', () => {
    @tags(['Foo'])
    class MyController {
      @get('/greet')
      greet() {
        return 'Hello world!';
      }

      @get('/echo')
      @tags(['Bar'], {append: true})
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
        @tags(['foo', 'bar'])
        public foo: string;

        @get('/greet')
        greet() {}
      }

      return getControllerSpec(MyController);
    };

    expect(shouldThrow).to.throw(/^\@tags cannot be used on a property:/);
  });
});
