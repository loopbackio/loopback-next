// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from 'testlab';
import {inject, describeInjectedArguments} from '../../src/inject';

describe('function argument injection', () => {
  it('can decorate class constructor arguments', () => {
    class TestClass {
      constructor(@inject('foo') foo: string) {
      }
    }
    // the test passes when TypeScript Compiler is happy
  });

  it('can retrieve information about injected constructor arguments', () => {
    class TestClass {
      constructor(@inject('foo') foo: string) {
      }
    }

    const meta = describeInjectedArguments(TestClass);
    expect(meta).to.deepEqual(['foo']);
  });

  it('returns an empty array when no ctor arguments are decorated', () => {
    class TestClass {
      constructor(foo: string) {
      }
    }

    const meta = describeInjectedArguments(TestClass);
    expect(meta).to.deepEqual([]);
  });
});
