// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/http-caching-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {HttpCachingProxy} from '../../http-caching-proxy';

describe('HttpCachingProxy', () => {
  describe('constructor', () => {
    it('rejects missing cachePath option', () => {
      expect(
        // tslint:disable-next-line:no-any
        () => new HttpCachingProxy({cachedPath: undefined} as any),
      ).throwError(/required option.*cachePath/i);
    });
  });
});
