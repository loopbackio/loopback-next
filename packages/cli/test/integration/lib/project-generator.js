// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const yeoman = require('yeoman-environment');
const testUtils = require('../../test-utils');
const sinon = require('sinon');
const path = require('path');
const deps = require('../../../lib/utils').getDependencies();
const expect = require('@loopback/testlab').expect;

module.exports = function(projGenerator, props, projectType) {
  return function() {
    // Increase the timeout to 60 seconds to accomodate
    // for possibly slow CI build machines
    // eslint-disable-next-line no-invalid-this
    this.timeout(60 * 1000);

    describe('help', () => {
      it('prints lb4', () => {
        const env = yeoman.createEnv();
        const name = projGenerator.substring(
          projGenerator.lastIndexOf(path.sep) + 1,
        );
        env.register(projGenerator, 'loopback4:' + name);
        const generator = env.create('loopback4:' + name);
        const helpText = generator.help();
        assert(helpText.match(/lb4 /));
        assert(!helpText.match(/loopback4:/));
      });
    });

    describe('_setupGenerator', () => {
      describe('args validation', () => {
        it('errors out if validation fails for an argument value', () => {
          const result = testUtils
            .executeGenerator(projGenerator)
            .withArguments(['fooBar']);
          return expect(result).to.be.rejectedWith(
            /Invalid npm package name\: fooBar/,
          );
        });

        it('errors out if validation fails for an option value', () => {
          const result = testUtils
            .executeGenerator(projGenerator)
            .withOptions({name: 'fooBar'})
            .toPromise();
          return expect(result).to.be.rejectedWith(
            /Invalid npm package name\: fooBar/,
          );
        });

        it('succeeds if no arg is provided', () => {
          assert.doesNotThrow(() => {
            testUtils.testSetUpGen(projGenerator);
          }, Error);
        });

        it('succeeds if arg is valid', () => {
          assert.doesNotThrow(() => {
            testUtils.testSetUpGen(projGenerator, {args: ['foobar']});
          }, Error);
        });
      });
      describe('argument and options setup', () => {
        it('has name argument set up', () => {
          const gen = testUtils.testSetUpGen(projGenerator);
          const helpText = gen.help();
          assert(helpText.match(/\[<name>\]/));
          assert(helpText.match(/# Project name for the /));
          assert(helpText.match(/Type: String/));
          assert(helpText.match(/Required: false/));
        });

        it('has description option set up', () => {
          const gen = testUtils.testSetUpGen(projGenerator);
          const helpText = gen.help();
          assert(helpText.match(/--description/));
          assert(helpText.match(/# Description for the /));
        });

        it('has outdir option set up', () => {
          const gen = testUtils.testSetUpGen(projGenerator);
          const helpText = gen.help();
          assert(helpText.match(/--outdir/));
          assert(helpText.match(/# Project root directory /));
        });

        it('has private option set up', () => {
          const gen = testUtils.testSetUpGen(projGenerator);
          const helpText = gen.help();
          assert(helpText.match(/--private/));
          assert(
            helpText.match(
              /# Mark the project private \(excluded from npm publish\)/,
            ),
          );
        });

        it('has eslint option set up', () => {
          const gen = testUtils.testSetUpGen(projGenerator);
          const helpText = gen.help();
          assert(helpText.match(/--eslint/));
          assert(helpText.match(/# Enable eslint/));
        });

        it('has prettier option set up', () => {
          const gen = testUtils.testSetUpGen(projGenerator);
          const helpText = gen.help();
          assert(helpText.match(/--prettier/));
          assert(helpText.match(/# Enable prettier/));
        });

        it('has mocha option set up', () => {
          const gen = testUtils.testSetUpGen(projGenerator);
          const helpText = gen.help();
          assert(helpText.match(/--mocha/));
          assert(helpText.match(/# Enable mocha/));
        });

        it('has loopbackBuild option set up', () => {
          const gen = testUtils.testSetUpGen(projGenerator);
          const helpText = gen.help();
          assert(helpText.match(/--loopbackBuild/));
          assert(helpText.match(/# Use @loopback\/build/));
        });

        it('has vscode option set up', () => {
          const gen = testUtils.testSetUpGen(projGenerator);
          const helpText = gen.help();
          assert(helpText.match(/--vscode/));
          assert(helpText.match(/# Use preconfigured VSCode settings/));
        });
      });
    });

    describe('setOptions', () => {
      it('has projectInfo set up', async () => {
        const gen = testUtils.testSetUpGen(projGenerator);
        gen.options = {
          name: 'foobar',
          description: null,
          outdir: null,
          eslint: null,
          prettier: true,
          mocha: null,
          loopbackBuild: null,
          vscode: null,
        };
        await gen.setOptions();
        assert(gen.projectInfo.name === 'foobar');
        assert(
          gen.projectInfo.dependencies['@loopback/context'] ===
            deps['@loopback/context'],
        );
        assert(
          gen.projectInfo.dependencies['@loopback/core'] ===
            deps['@loopback/core'],
        );
        assert(gen.projectInfo.description !== null);
        assert(gen.projectInfo.prettier === true);
      });
    });

    describe('promptProjectName', () => {
      it('incorporates user input into projectInfo', () => {
        const gen = testUtils.testSetUpGen(projGenerator);
        return testPrompt(
          gen,
          {
            name: 'foobar',
            description: 'foobar description',
          },
          'promptProjectName',
        ).then(() => {
          gen.prompt.restore();
          assert(gen.projectInfo.name);
          assert(gen.projectInfo.description);
          assert(gen.projectInfo.name === 'foobar');
          assert(gen.projectInfo.description === 'foobar description');
        });
      });
    });

    describe('promptProjectDir', () => {
      it('incorporates user input into projectInfo', () => {
        const gen = testUtils.testSetUpGen(projGenerator);
        return testPrompt(
          gen,
          {
            outdir: 'foobar',
          },
          'promptProjectDir',
        ).then(() => {
          gen.prompt.restore();
          assert(gen.projectInfo.outdir);
          assert(gen.projectInfo.outdir === 'foobar');
        });
      });
    });

    describe('promptOptions', () => {
      it('incorporates user input into projectInfo', () => {
        const gen = testUtils.testSetUpGen(projGenerator);
        return testPrompt(
          gen,
          {
            settings: [
              'Enable eslint',
              'Enable prettier',
              'Enable mocha',
              'Enable loopbackBuild',
              'Enable vscode',
            ],
          },
          'promptOptions',
        ).then(() => {
          gen.prompt.restore();
          assert(gen.projectInfo.eslint === true);
          assert(gen.projectInfo.prettier === true);
          assert(gen.projectInfo.mocha === true);
          assert(gen.projectInfo.loopbackBuild === true);
          assert(gen.projectInfo.vscode === true);
        });
      });
    });

    describe('without settings', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(props);
      });

      it('creates files', () => {
        assert.file([
          'package.json',
          '.yo-rc.json',
          '.prettierrc',
          '.gitignore',
          '.npmrc',
          '.eslintrc.js',
          'src/index.ts',
          '.vscode/settings.json',
          '.vscode/tasks.json',
        ]);
        assert.jsonFileContent('package.json', props);
        assert.fileContent([
          ['package.json', '@loopback/build'],
          ['package.json', '"typescript"'],
          ['package.json', '"eslint"'],
          ['package.json', 'eslint-config-prettier'],
          ['package.json', 'eslint-plugin-eslint-plugin'],
          ['package.json', 'eslint-plugin-mocha'],
          ['package.json', '@typescript-eslint/eslint-plugin'],
          ['package.json', '@loopback/eslint-config'],
          ['package.json', 'source-map-support'],
          ['.eslintrc.js', '@loopback/eslint-config'],
          ['tsconfig.json', '@loopback/build'],
        ]);
        assert.noFileContent([['.eslintrc.js', '"rules"']]);

        if (projectType === 'application') {
          assert.fileContent(
            'package.json',
            `"@loopback/core": "${deps['@loopback/core']}"`,
          );
          assert.fileContent(
            'package.json',
            `"@loopback/context": "${deps['@loopback/context']}"`,
          );
          assert.fileContent(
            'package.json',
            `"@loopback/rest": "${deps['@loopback/rest']}"`,
          );
          assert.fileContent(
            'package.json',
            `"@loopback/openapi-v3": "${deps['@loopback/openapi-v3']}"`,
          );
          assert.jsonFileContent('package.json', {
            scripts: {
              prestart: 'npm run build',
              start: 'node -r source-map-support/register .',
            },
          });
        }
        if (projectType === 'extension') {
          assert.fileContent(
            'package.json',
            `"@loopback/core": "${deps['@loopback/core']}"`,
          );
          assert.fileContent(
            'package.json',
            `"@loopback/context": "${deps['@loopback/context']}"`,
          );
          assert.noFileContent('package.json', '"@loopback/rest"');
          assert.noFileContent('package.json', '"@loopback/openapi-v3"');
          assert.noJsonFileContent('package.json', {
            prestart: 'npm run build',
            start: 'node .',
          });
        }
      });
    });

    describe('with loopbackBuild disabled', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(
          Object.assign(
            {
              settings: [
                // Force Enable loopbackBuild to be unchecked
                'Disable loopbackBuild',
                'Enable eslint',
                'Enable prettier',
                'Enable mocha',
                'Enable vscode',
              ],
            },
            props,
          ),
        );
      });

      it('creates files', () => {
        assert.jsonFileContent('package.json', props);
        assert.fileContent(
          'package.json',
          `"@loopback/core": "${deps['@loopback/core']}"`,
        );
        assert.fileContent(
          'package.json',
          `"@loopback/context": "${deps['@loopback/context']}"`,
        );
        assert.fileContent('package.json', `"rimraf": "${deps['rimraf']}"`);
        assert.noFileContent([
          ['package.json', '@loopback/build'],
          ['package.json', '@loopback/dist-util'],
          ['tsconfig.json', '@loopback/build'],
        ]);
        assert.fileContent([
          ['package.json', '"clean": "rimraf dist *.tsbuildinfo"'],
          ['package.json', '"typescript"'],
          ['package.json', '"eslint"'],
          ['package.json', 'eslint-config-prettier'],
          ['package.json', 'eslint-plugin-eslint-plugin'],
          ['package.json', 'eslint-plugin-mocha'],
          ['package.json', '@typescript-eslint/eslint-plugin'],
          ['package.json', '@loopback/eslint-config'],
          ['package.json', '"prettier"'],
          ['.eslintrc.js', "extends: '@loopback/eslint-config'"],
          ['tsconfig.json', '"compilerOptions"'],
          ['tsconfig.json', '"resolveJsonModule": true'],
          ['index.js', "require('./dist')"],
        ]);
      });
    });

    describe('with prettier disabled', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(
          Object.assign(
            {
              settings: [
                'Enable loopbackBuild',
                'Enable eslint',
                'Disable prettier', // Force Enable prettier to be unchecked
                'Enable mocha',
                'Enable vscode',
              ],
            },
            props,
          ),
        );
      });

      it('creates files', () => {
        assert.noFile(['.prettierrc', '.prettierrcignore']);
        assert.jsonFileContent('package.json', props);
      });
    });

    describe('with eslint disabled', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(
          Object.assign(
            {
              settings: [
                'Enable loopbackBuild',
                'Disable eslint', // Force Enable eslint to be unchecked
                'Enable prettier',
                'Enable mocha',
                'Enable vscode',
              ],
            },
            props,
          ),
        );
      });

      it('creates files', () => {
        assert.noFile(
          ['.eslintrc.js', 'eslint.build.json'],
          ['package.json', '"eslint"'],
          ['package.json', 'eslint-config-prettier'],
          ['package.json', 'eslint-plugin-eslint-plugin'],
          ['package.json', 'eslint-plugin-mocha'],
          ['package.json', '@typescript-eslint/eslint-plugin'],
          ['package.json', '@loopback/eslint-config'],
        );
        assert.jsonFileContent('package.json', props);
      });
    });

    describe('with loopbackBuild & eslint disabled', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(
          Object.assign(
            {
              settings: [
                // Force Enable loopbackBuild to be unchecked
                'Disable loopbackBuild',
                // Force Enable eslint to be unchecked
                'Disable eslint',
                'Enable prettier',
                'Enable mocha',
                'Enable vscode',
              ],
            },
            props,
          ),
        );
      });

      it('creates files', () => {
        assert.jsonFileContent('package.json', props);
        assert.noFile(['.eslintrc.js', 'eslint.build.json']);
        assert.noFileContent([
          ['package.json', '@loopback/build'],
          ['package.json', '"eslint"'],
          ['package.json', 'eslint-config-prettier'],
          ['package.json', 'eslint-plugin-eslint-plugin'],
          ['package.json', 'eslint-plugin-mocha'],
          ['package.json', '@typescript-eslint/eslint-plugin'],
          ['package.json', '@loopback/eslint-config'],
          ['tsconfig.json', '@loopback/build'],
        ]);
        assert.fileContent([
          ['package.json', '"typescript"'],
          ['package.json', '"prettier"'],
          ['tsconfig.json', '"compilerOptions"'],
        ]);
        assert.noFileContent([['package.json', '"eslint"']]);
      });
    });

    describe('with vscode disabled', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(
          Object.assign(
            {
              settings: [
                'Enable loopbackBuild',
                'Enable eslint',
                'Enable prettier',
                'Enable mocha',
                'Disable vscode', // Force Enable vscode to be unchecked
              ],
            },
            props,
          ),
        );
      });

      it('does not create .vscode files', () => {
        assert.noFile('.vscode/');
      });
    });

    describe('with --skip-optional-prompts', () => {
      before(() => {
        return helpers.run(projGenerator).withOptions({
          name: props.name,
          'skip-optional-prompts': true,
        });
      });

      it('creates files', () => {
        assert.jsonFileContent('package.json', {
          name: props.name,
          description: props.name,
        });
      });
    });

    async function testPrompt(gen, prompts, fnName) {
      await gen.setOptions();
      // eslint-disable-next-line require-atomic-updates
      gen.prompt = sinon.stub(gen, 'prompt');
      gen.prompt.resolves(prompts);
      return gen[fnName]();
    }
  };
};
