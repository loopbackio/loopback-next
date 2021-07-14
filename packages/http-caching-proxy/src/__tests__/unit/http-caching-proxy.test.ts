// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/http-caching-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {HttpCachingProxy} from '../../http-caching-proxy';

describe('HttpCachingProxy', () => {
  describe('constructor', () => {
    it('rejects missing cachePath option', () => {
      expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => new HttpCachingProxy({cachedPath: undefined} as any),
      ).throwError(/required option.*cachePath/i);
    });
  });
});
