// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const expect = require('@loopback/testlab').expect;
const ArtifactGenerator = require('../../lib/artifact-generator');

describe('ArtifactGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = Object.create(ArtifactGenerator.prototype);
    generator.artifactInfo = {
      type: 'model',
      name: undefined,
      outDir: 'src/models',
      defaultName: 'MyModel',
    };
    generator.options = {};
    generator.log = () => {};
    generator.destinationPath = () => '/test/path';
  });

  describe('setOptions', () => {
    it('validates class name when provided', () => {
      generator.options.name = '2InvalidName';
      expect(() => generator.setOptions()).to.throw(
        /Class name cannot start with a number/,
      );
    });

    it('accepts valid class name', () => {
      generator.options.name = 'ValidName';
      generator.setOptions();
      expect(generator.artifactInfo.name).to.equal('ValidName');
    });

    it('sets relative path correctly', () => {
      generator.options.name = 'TestModel';
      generator.setOptions();
      expect(generator.artifactInfo.relPath).to.be.a.String();
    });
  });

  describe('promptClassFileName', () => {
    it('logs the correct file creation message', () => {
      let loggedMessage = '';
      generator.log = msg => {
        loggedMessage += msg;
      };

      generator.promptClassFileName('model', 'models', 'MyModel');
      expect(loggedMessage).to.match(/Model MyModel will be created/);
      expect(loggedMessage).to.match(/src\/models\/my-model\.model\.ts/);
    });
  });

  describe('scaffold', () => {
    it('capitalizes artifact name', () => {
      generator.artifactInfo.name = 'myModel';
      generator.shouldExit = () => false;
      generator.copyTemplatedFiles = () => {};
      generator.templatePath = () => '';
      generator.destinationPath = () => '';

      generator.scaffold();
      expect(generator.artifactInfo.name).to.equal('MyModel');
    });

    it('does not scaffold when shouldExit is true', () => {
      generator.shouldExit = () => true;
      const result = generator.scaffold();
      expect(result).to.equal(false);
    });
  });

  describe('_updateIndexFiles', () => {
    it('skips update when disableIndexUpdate is true', async () => {
      generator.artifactInfo.disableIndexUpdate = true;
      await generator._updateIndexFiles();
      // Should complete without error
    });

    it('creates default index update array when outDir and outFile exist', async () => {
      generator.artifactInfo.outDir = 'src/models';
      generator.artifactInfo.outFile = 'my-model.model.ts';
      generator.artifactInfo.indexesToBeUpdated = [];
      generator._updateIndexFile = () => Promise.resolve();

      await generator._updateIndexFiles();
      expect(generator.artifactInfo.indexesToBeUpdated).to.have.length(1);
      expect(generator.artifactInfo.indexesToBeUpdated[0]).to.deepEqual({
        dir: 'src/models',
        file: 'my-model.model.ts',
      });
    });
  });

  describe('classNameSeparator', () => {
    it('has default separator', () => {
      expect(generator.classNameSeparator).to.equal(', ');
    });
  });
});

// Made with Bob
