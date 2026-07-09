// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const expect = require('@loopback/testlab').expect;
const ProjectGenerator = require('../../lib/project-generator');

describe('ProjectGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = Object.create(ProjectGenerator.prototype);
    generator.options = {};
    generator.projectInfo = {};
    generator.log = () => {};
    generator.exit = () => {};
    generator.shouldExit = () => false;
    generator.user = {
      git: {
        name: () => 'Test User',
        email: () => 'test@example.com',
      },
    };
    generator.config = {
      get: () => 'npm',
      set: () => {},
    };
    generator.destinationPath = path => path || '/test/path';
    generator.templatePath = path => path || '/template/path';
    generator.fs = {
      move: () => {},
      delete: () => {},
    };
    generator.copyTemplatedFiles = () => {};
  });

  describe('constructor', () => {
    it('initializes buildOptions', () => {
      const gen = new ProjectGenerator([], {});
      expect(gen.buildOptions).to.be.an.Array();
      expect(gen.buildOptions.length).to.be.greaterThan(0);
    });

    it('includes expected build options', () => {
      const gen = new ProjectGenerator([], {});
      const optionNames = gen.buildOptions.map(opt => opt.name);
      expect(optionNames).to.containEql('eslint');
      expect(optionNames).to.containEql('prettier');
      expect(optionNames).to.containEql('mocha');
      expect(optionNames).to.containEql('loopbackBuild');
      expect(optionNames).to.containEql('editorconfig');
      expect(optionNames).to.containEql('vscode');
    });
  });

  describe('setOptions', () => {
    it('validates project name when provided', async () => {
      generator.options.name = 'Invalid Name With Spaces';
      let exitCalled = false;
      generator.exit = () => {
        exitCalled = true;
      };

      await generator.setOptions();
      expect(exitCalled).to.equal(true);
    });

    it('sets projectInfo with valid name', async () => {
      generator.options.name = 'valid-project-name';
      generator.options.description = 'Test description';

      await generator.setOptions();
      expect(generator.projectInfo.name).to.equal('valid-project-name');
      expect(generator.projectInfo.description).to.equal('Test description');
    });

    it('includes dependencies in projectInfo', async () => {
      await generator.setOptions();
      expect(generator.projectInfo.dependencies).to.be.an.Object();
    });
  });

  describe('scaffold', () => {
    it('does not scaffold when shouldExit is true', () => {
      generator.shouldExit = () => true;
      const result = generator.scaffold();
      expect(result).to.equal(false);
    });

    it('sets destination root to project outdir', () => {
      generator.projectInfo.outdir = 'my-project';
      let destinationSet = false;
      generator.destinationRoot = dir => {
        destinationSet = dir === 'my-project';
      };

      generator.scaffold();
      expect(destinationSet).to.equal(true);
    });

    it('deletes eslint files when eslint is disabled', () => {
      generator.projectInfo.eslint = false;
      const deletedFiles = [];
      generator.fs.delete = file => {
        deletedFiles.push(file);
      };

      generator.scaffold();
      expect(deletedFiles.some(f => f.includes('.eslintrc'))).to.equal(true);
      expect(deletedFiles.some(f => f.includes('.eslintignore'))).to.equal(
        true,
      );
    });

    it('deletes prettier files when prettier is disabled', () => {
      generator.projectInfo.prettier = false;
      const deletedFiles = [];
      generator.fs.delete = file => {
        deletedFiles.push(file);
      };

      generator.scaffold();
      expect(deletedFiles.some(f => f.includes('.prettier'))).to.equal(true);
    });

    it('deletes mocha config when mocha is disabled', () => {
      generator.projectInfo.mocha = false;
      const deletedFiles = [];
      generator.fs.delete = file => {
        deletedFiles.push(file);
      };

      generator.scaffold();
      expect(deletedFiles.some(f => f.includes('.mocharc.json'))).to.equal(
        true,
      );
    });

    it('deletes editorconfig when editorconfig is disabled', () => {
      generator.projectInfo.editorconfig = false;
      const deletedFiles = [];
      generator.fs.delete = file => {
        deletedFiles.push(file);
      };

      generator.scaffold();
      expect(deletedFiles.some(f => f.includes('.editorconfig'))).to.equal(
        true,
      );
    });

    it('deletes vscode folder when vscode is disabled', () => {
      generator.projectInfo.vscode = false;
      const deletedFiles = [];
      generator.fs.delete = file => {
        deletedFiles.push(file);
      };

      generator.scaffold();
      expect(deletedFiles.some(f => f.includes('.vscode'))).to.equal(true);
    });

    it('deletes .npmrc when using yarn', () => {
      generator.options.packageManager = 'yarn';
      const deletedFiles = [];
      generator.fs.delete = file => {
        deletedFiles.push(file);
      };

      generator.scaffold();
      expect(deletedFiles.some(f => f.includes('.npmrc'))).to.equal(true);
    });
  });

  describe('buildOptions', () => {
    it('each option has name and description', () => {
      const gen = new ProjectGenerator([], {});
      gen.buildOptions.forEach(opt => {
        expect(opt.name).to.be.a.String();
        expect(opt.description).to.be.a.String();
      });
    });
  });
});

// Made with Bob
