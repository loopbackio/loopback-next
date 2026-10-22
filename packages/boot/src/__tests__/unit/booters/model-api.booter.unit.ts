// Copyright IBM Corp. and LoopBack contributors 2025. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ModelApiBuilder} from '@loopback/model-api-builder';
import {ApplicationWithRepositories} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {ModelApiBooter} from '../../..';

describe('model API booter unit tests', () => {
  describe('getApiBuilderForPattern()', () => {
    it('returns the builder matching the pattern', async () => {
      const builder = givenBuilder('rest');
      const booter = givenBooter([givenBuilder('other'), builder]);

      expect(await booter.getApiBuilderForPattern('rest')).to.equal(builder);
    });

    it('lists the available patterns if no builder matches', async () => {
      const booter = givenBooter([givenBuilder('rest'), givenBuilder('grpc')]);

      await expect(
        booter.getApiBuilderForPattern('missing'),
      ).to.be.rejectedWith(
        'Unsupported API pattern "missing". Available patterns: rest, grpc',
      );
    });

    it('reports <none> if there are no builders registered', async () => {
      const booter = givenBooter([]);

      await expect(booter.getApiBuilderForPattern('rest')).to.be.rejectedWith(
        'Unsupported API pattern "rest". Available patterns: <none>',
      );
    });
  });

  function givenBuilder(pattern: string): ModelApiBuilder {
    return {pattern, build: async () => {}};
  }

  function givenBooter(builders: ModelApiBuilder[]) {
    return new ModelApiBooter(
      {} as ApplicationWithRepositories,
      __dirname,
      async () => builders,
    );
  }
});
