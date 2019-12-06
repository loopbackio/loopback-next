// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AnyObject, DeepPartial} from '../../common-types';

describe('common types', () => {
  describe('DeepPartial<T>', () => {
    it('works for strict models', () => {
      class Product {
        name: string;
      }
      check<Product>({name: 'a name'});
      // the test passes when the compiler is happy
    });

    it('works for free-form models', () => {
      class FreeForm {
        id: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      }
      check<FreeForm>({id: 1, name: 'a name'});
      // the test passes when the compiler is happy
    });

    it('works for AnyObject', () => {
      check<AnyObject>({id: 'some id', name: 'a name'});
      // the test passes when the compiler is happy
    });
  });
});

function check<T extends object>(data?: DeepPartial<T>) {
  // dummy function to run compile-time checks
  return data;
}
