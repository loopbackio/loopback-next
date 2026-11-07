// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import debugFactory from 'debug';
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

    it(`defaults 'dirs' / 'extensions' to empty arrays if not provided`, async () => {
      const booterInst = givenBaseBooter({});
      await booterInst.configure();
      expect(booterInst.dirs).to.eql([]);
      expect(booterInst.extensions).to.eql([]);
    });

    it(`creates and sets 'glob' pattern`, async () => {
      const booterInst = givenBaseBooter();
      const expected = '/{test,test2}/*@(.test.js|test2.js)';
      await booterInst.configure();
      expect(booterInst.glob).to.equal(expected);
    });

    it(`creates and sets 'glob' pattern (nested)`, async () => {
      const booterInst = givenBaseBooter(
        Object.assign({}, TEST_OPTIONS, {nested: true}),
      );
      const expected = '/{test,test2}/**/*@(.test.js|test2.js)';
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

  describe('artifactName', () => {
    it('is derived from the class name without the Booter suffix', () => {
      class WidgetBooter extends BaseArtifactBooter {}
      const booterInst = new WidgetBooter(__dirname, TEST_OPTIONS);
      expect(booterInst.artifactName).to.equal('Widget');
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

    it('discovers files matching the glob', async () => {
      const booterInst = givenBaseBooter(
        TEST_OPTIONS,
        resolve(__dirname, '../../fixtures'),
      );
      booterInst.glob = '/multiple.artifact.js';
      await booterInst.discover();
      expect(booterInst.discovered).to.eql([
        resolve(__dirname, '../../fixtures/multiple.artifact.js'),
      ]);
    });

    it('discovers files when debug logging is enabled', async () => {
      const namespaces = debugFactory.disable();
      const originalLog = debugFactory.log;
      // Keep the test output clean
      debugFactory.log = () => {};
      debugFactory.enable('loopback:boot:base-artifact-booter');
      try {
        const booterInst = givenBaseBooter(
          TEST_OPTIONS,
          resolve(__dirname, '../../fixtures'),
        );
        booterInst.glob = '/multiple.artifact.js';
        await booterInst.discover();
        expect(booterInst.discovered).to.have.lengthOf(1);
      } finally {
        debugFactory.log = originalLog;
        debugFactory.enable(namespaces);
      }
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

  function givenBaseBooter(
    options?: ArtifactOptions,
    projectRoot: string = __dirname,
  ) {
    return new BaseArtifactBooter(projectRoot, options ?? TEST_OPTIONS);
  }
});
