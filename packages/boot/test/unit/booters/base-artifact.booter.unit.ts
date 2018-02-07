// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BaseArtifactBooter} from '../../../index';
import {expect} from '@loopback/testlab';
import {resolve} from 'path';

describe('base-artifact booter unit tests', () => {
  let booterInst: BaseArtifactBooter;

  beforeEach(getBaseBooter);

  it('sets the projectRoot property from bootConfig', () => {
    booterInst = new BaseArtifactBooter({projectRoot: __dirname});
    expect(booterInst.projectRoot).to.equal(__dirname);
  });

  describe('configure()', () => {
    const options = {
      dirs: ['test', 'test2'],
      extensions: ['.test.js', 'test2.js'],
      nested: false,
    };

    it(`sets 'dirs' / 'extensions' properties as an array if a string`, async () => {
      booterInst.options = {dirs: 'test', extensions: '.test.js', nested: true};
      await booterInst.configure();
      expect(booterInst.dirs).to.be.eql(['test']);
      expect(booterInst.extensions).to.be.eql(['.test.js']);
    });

    it(`creates and sets 'glob' pattern`, async () => {
      booterInst.options = options;
      const expected = '/@(test|test2)/*@(.test.js|test2.js)';
      await booterInst.configure();
      expect(booterInst.glob).to.equal(expected);
    });

    it(`creates and sets 'glob' pattern (nested)`, async () => {
      booterInst.options = Object.assign({}, options, {nested: true});
      const expected = '/@(test|test2)/**/*@(.test.js|test2.js)';
      await booterInst.configure();
      expect(booterInst.glob).to.equal(expected);
    });

    it(`sets 'glob' pattern to options.glob if present`, async () => {
      const expected = '/**/*.glob';
      booterInst.options = Object.assign({}, options, {glob: expected});
      await booterInst.configure();
      expect(booterInst.glob).to.equal(expected);
    });
  });

  describe('discover()', () => {
    it(`sets 'discovered' property`, async () => {
      // Fake glob pattern so we get an empty array
      booterInst.glob = '/abc.xyz';
      await booterInst.discover();
      expect(booterInst.discovered).to.eql([]);
    });
  });

  describe('load()', () => {
    it(`sets 'classes' property to Classes from a file`, async () => {
      booterInst.discovered = [
        resolve(__dirname, '../../fixtures/multiple.artifact.js'),
      ];
      const NUM_CLASSES = 2; // Above file has 1 class in it.
      await booterInst.load();
      expect(booterInst.classes).to.have.a.lengthOf(NUM_CLASSES);
    });
  });

  async function getBaseBooter() {
    booterInst = new BaseArtifactBooter({projectRoot: __dirname});
  }
});
