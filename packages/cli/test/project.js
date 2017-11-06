// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const yeoman = require('yeoman-environment');

module.exports = function(projGenerator, props, projectType) {
  return function() {
    describe('help', () => {
      it('prints lb4', () => {
        const env = yeoman.createEnv();
        const name = projGenerator.substring(
          projGenerator.lastIndexOf('/') + 1
        );
        env.register(projGenerator, 'loopback4:' + name);
        const generator = env.create('loopback4:' + name);
        const helpText = generator.help();
        assert(helpText.match(/lb4 /));
        assert(!helpText.match(/loopback4:/));
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
          'tslint.json',
          'src/index.ts',
        ]);
        assert.jsonFileContent('package.json', props);
        assert.fileContent([
          ['package.json', '@loopback/build'],
          ['tslint.json', '@loopback/build'],
          ['tsconfig.json', '@loopback/build'],
        ]);
        assert.noFileContent([
          ['package.json', '"typescript"'],
          ['tslint.json', '"rules"'],
          ['tsconfig.json', '"compilerOptions"'],
        ]);

        if (projectType === 'application') {
          assert.fileContent('package.json', '"@loopback/core"');
          assert.fileContent('package.json', '"@loopback/context"');
          assert.fileContent('package.json', '"@loopback/rest"');
        }
        if (projectType === 'extension') {
          assert.fileContent('package.json', '"@loopback/core"');
          assert.fileContent('package.json', '"@loopback/context"');
          assert.noFileContent('package.json', '"@loopback/rest"');
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
                'Enable tslint',
                'Enable prettier',
                'Enable mocha',
              ],
            },
            props
          )
        );
      });

      it('creates files', () => {
        assert.jsonFileContent('package.json', props);
        assert.noFileContent([
          ['package.json', '@loopback/build'],
          ['tslint.json', '@loopback/build'],
          ['tsconfig.json', '@loopback/build'],
        ]);
        assert.fileContent([
          ['package.json', '"typescript"'],
          ['package.json', '"tslint"'],
          ['package.json', '"prettier"'],
          ['tslint.json', '"rules"'],
          ['tsconfig.json', '"compilerOptions"'],
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
                'Enable tslint',
                'Disable prettier', // Force Enable prettier to be unchecked
                'Enable mocha',
              ],
            },
            props
          )
        );
      });

      it('creates files', () => {
        assert.noFile(['.prettierrc', '.prettierrcignore']);
        assert.jsonFileContent('package.json', props);
      });
    });

    describe('with tslint disabled', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(
          Object.assign(
            {
              settings: [
                'Enable loopbackBuild',
                'Disable tslint', // Force Enable tslint to be unchecked
                'Enable prettier',
                'Enable mocha',
              ],
            },
            props
          )
        );
      });

      it('creates files', () => {
        assert.noFile(['tslint.json', 'tslint.build.json']);
        assert.jsonFileContent('package.json', props);
      });
    });

    describe('with loopbackBuild & tslint disabled', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(
          Object.assign(
            {
              settings: [
                // Force Enable loopbackBuild to be unchecked
                'Disable loopbackBuild',
                // Force Enable tslint to be unchecked
                'Disable tslint',
                'Enable prettier',
                'Enable mocha',
              ],
            },
            props
          )
        );
      });

      it('creates files', () => {
        assert.jsonFileContent('package.json', props);
        assert.noFile(['tslint.json', 'tslint.build.json']);
        assert.noFileContent([
          ['package.json', '@loopback/build'],
          ['tsconfig.json', '@loopback/build'],
        ]);
        assert.fileContent([
          ['package.json', '"typescript"'],
          ['package.json', '"prettier"'],
          ['tsconfig.json', '"compilerOptions"'],
        ]);
        assert.noFileContent([['package.json', '"tslint"']]);
      });
    });
  };
};
