// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {resolve} from 'path';
import {ArtifactOptions, BaseArtifactBooter} from '../../..';

describe('base-artifact booter unit tests', () => {
  const TEST_OPTIONS = {
    dirs: ['test', 'test2'],
    extensions: ['.test.js', 'test2.js'],
    nested: false,
  };

  describe('configure()', () => {
    it(`sets 'dirs' / 'extensions' properties as an array if a string`, async () => {
      const booterInst = givenBaseBooter({
        dirs: 'test',
        extensions: '.test.js',
        nested: true,
      });
      await booterInst.configure();
      expect(booterInst.dirs).to.be.eql(['test']);
      expect(booterInst.extensions).to.be.eql(['.test.js']);
    });

    it(`creates and sets 'glob' pattern`, async () => {
      const booterInst = givenBaseBooter();
      const expected = '/@(test|test2)/*@(.test.js|test2.js)';
      await booterInst.configure();
      expect(booterInst.glob).to.equal(expected);
    });

    it(`creates and sets 'glob' pattern (nested)`, async () => {
      const booterInst = givenBaseBooter(
        Object.assign({}, TEST_OPTIONS, {nested: true}),
      );
      const expected = '/@(test|test2)/**/*@(.test.js|test2.js)';
      await booterInst.configure();
      expect(booterInst.glob).to.equal(expected);
    });

    it(`sets 'glob' pattern to options.glob if present`, async () => {
      const expected = '/**/*.glob';
      const booterInst = givenBaseBooter(
        Object.assign({}, TEST_OPTIONS, {glob: expected}),
      );
      await booterInst.configure();
      expect(booterInst.glob).to.equal(expected);
    });
  });

  describe('discover()', () => {
    it(`sets 'discovered' property`, async () => {
      const booterInst = givenBaseBooter();
      // Fake glob pattern so we get an empty array
      booterInst.glob = '/abc.xyz';
      await booterInst.discover();
      expect(booterInst.discovered).to.eql([]);
    });
  });

  describe('load()', () => {
    it(`sets 'classes' property to Classes from a file`, async () => {
      const booterInst = givenBaseBooter();
      booterInst.discovered = [
        resolve(__dirname, '../../fixtures/multiple.artifact.js'),
      ];
      const NUM_CLASSES = 2; // Above file has 1 class in it.
      await booterInst.load();
      expect(booterInst.classes).to.have.a.lengthOf(NUM_CLASSES);
    });
  });

  function givenBaseBooter(options?: ArtifactOptions) {
    return new BaseArtifactBooter(__dirname, options ?? TEST_OPTIONS);
  }
});
