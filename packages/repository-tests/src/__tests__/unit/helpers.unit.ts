// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  deleteAllModelsInDefaultDataSource,
  getCrudContext,
  MixedIdType,
  withCrudCtx,
} from '../../helpers.repository-tests';

describe('helpers.repository-tests', () => {
  describe('getCrudContext', () => {
    it('is exported as a function', () => {
      expect(getCrudContext).to.be.a.Function();
    });
  });

  describe('withCrudCtx', () => {
    it('is exported as a function', () => {
      expect(withCrudCtx).to.be.a.Function();
    });

    it('returns a function', () => {
      const wrappedFn = withCrudCtx(() => {
        // no-op
      });
      expect(wrappedFn).to.be.a.Function();
    });
  });

  describe('deleteAllModelsInDefaultDataSource', () => {
    it('is exported as a function', () => {
      expect(deleteAllModelsInDefaultDataSource).to.be.a.Function();
    });
  });

  describe('MixedIdType', () => {
    it('accepts string values', () => {
      const id: MixedIdType = 'abc123';
      expect(id).to.be.a.String();
    });

    it('accepts number values', () => {
      const id: MixedIdType = 123;
      expect(id).to.be.a.Number();
    });
  });
});

// Made with Bob
