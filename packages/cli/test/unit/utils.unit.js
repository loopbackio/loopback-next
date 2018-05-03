// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const expect = require('@loopback/testlab').expect;
const path = require('path');
const utils = require('../../lib/utils');

describe('Utils', () => {
  describe('validateClassName', () => {
    describe('validRegex', () => {
      const regex = utils.validRegex;
      it('should return a RegExp', () => {
        expect(regex).to.be.an.instanceOf(RegExp);
      });
      it('should match "className"', () => {
        expect(regex.test('className')).to.equal(true);
      });
    });
    describe('should not validate', () => {
      testValidateName(
        'if the class name is empty',
        '',
        /name cannot be empty/,
      );
      testValidateName(
        'if the class name is null',
        null,
        /name cannot be empty/,
      );
      testValidateName(
        'if the first character is a digit',
        '2Controller',
        /name cannot start with a number/,
      );
      testValidateName(
        'if the class name contains a period',
        'Cool.App',
        /name cannot contain \./,
      );
      testValidateName(
        'if the class name contains a space',
        'foo bar',
        /name cannot contain space/,
      );
      testValidateName(
        'if the class name contains a hyphen',
        'foo-bar',
        /name cannot contain hyphen/,
      );
      testValidateName(
        'if the class name contains special characters',
        'Foo%bar',
        /name cannot contain special character/,
      );
      testValidateName(
        'if the class name contains other invalid symbols',
        'foo♡bar',
        /name is invalid/,
      );
      function testValidateName(testName, input, expected) {
        it(testName, () => {
          expect(utils.validateClassName(input)).to.match(expected);
        });
      }
    });
    describe('should validate', () => {
      testCorrectName('if the class name is a word', 'foobar');
      testCorrectName('if the class name contains upper case letter', 'fooBar');
      testCorrectName(
        'if the class name contains a digit in the middle',
        'foo2bar',
      );
      testCorrectName(
        'if the class name contains non-English letter',
        'fooβbar',
      );
      testCorrectName(
        'if the first character has an accented character',
        'Óoobar',
      );
      function testCorrectName(testName, input) {
        it(testName, () => {
          expect(utils.validateClassName(input)).to.equal(true);
        });
      }
    });
  });
  describe('toClassName', () => {
    describe('should error', () => {
      testExpectError('if input is empty', '', /no input/);
      testExpectError('if input is null', null, /bad input/);
      testExpectError('if input is not a string', 42, /bad input/);
    });
    describe('should have no effect', () => {
      testExpectNoChange('if first letter is capitalized', 'FooBar');
      testExpectNoChange('if first letter is not convertible', '$fooBar');
    });
    describe('should capitalize first letter', () => {
      testExpectUpperCase('if first letter is lower case', 'fooBar', 'FooBar');
      testExpectUpperCase(
        'if first letter is lower case in different language',
        'óooBar',
        'ÓooBar',
      );
    });
    function testExpectError(testName, input, expected) {
      it(testName, () => {
        expect(utils.toClassName(input)).to.match(expected);
      });
    }
    function testExpectNoChange(testName, input) {
      it(testName, () => {
        expect(utils.toClassName(input)).to.equal(input);
      });
    }
    function testExpectUpperCase(testName, input, expected) {
      it(testName, () => {
        expect(utils.toClassName(input)).to.equal(expected);
      });
    }
  });
  describe('findArtifactPaths', () => {
    it('returns all matching paths of type', () => {
      const expected = [
        path.join('tmp', 'app', 'models', 'foo.model.js'),
        path.join('tmp', 'app', 'models', 'baz.model.js'),
      ];

      const reader = () => {
        // Add the expected values to some extras.
        return [
          path.join('tmp', 'app', 'models', 'bar.js'),
          path.join('tmp', 'app', 'models', 'README.js'),
        ].concat(expected);
      };

      return utils
        .findArtifactPaths(path.join('fake', 'path'), 'model', reader)
        .then(results => {
          expect(results).to.eql(expected);
        });
    });
  });
  describe('getArtifactList', () => {
    const expectedModels = ['Foo', 'Bar'];
    const expectedRepos = ['FooRepository', 'BarRepository'];
    it('finds JS models', () => {
      const files = [
        path.join('tmp', 'app', 'foo.model.js'),
        path.join('tmp', 'app', 'bar.model.js'),
        path.join('tmp', 'app', 'README.md'),
      ];
      return verifyArtifactList('model', 'models', false, files).then(
        results => {
          expect(results).to.eql(expectedModels);
        },
      );
    });

    it('finds TS models', () => {
      const files = [
        path.join('tmp', 'app', 'foo.model.ts'),
        path.join('tmp', 'app', 'bar.model.ts'),
        path.join('tmp', 'app', 'README.md'),
      ];
      return verifyArtifactList('model', 'models', false, files).then(
        results => {
          expect(results).to.eql(expectedModels);
        },
      );
    });

    it('finds JS repositories', () => {
      const files = [
        path.join('tmp', 'app', 'foo.repository.js'),
        path.join('tmp', 'app', 'bar.repository.js'),
        path.join('tmp', 'app', 'foo.model.js'),
      ];
      return verifyArtifactList(
        'repository',
        'repositories',
        true,
        files,
        expectedRepos,
      ).then(results => {
        expect(results).to.eql(expectedRepos);
      });
    });

    it('finds TS repositories', () => {
      const files = [
        path.join('tmp', 'app', 'foo.repository.ts'),
        path.join('tmp', 'app', 'bar.repository.ts'),
        path.join('tmp', 'app', 'foo.model.ts'),
      ];
      return verifyArtifactList(
        'repository',
        'repositories',
        true,
        files,
        expectedRepos,
      ).then(results => {
        expect(results).to.eql(expectedRepos);
      });
    });

    /**
     * Testing function for evaluating the lists returned from
     * the getArtifactList function.
     *
     * @param {string} artifactType The artifact type under test
     * @param {string} folder The name of the folder (usually the plural of the
     * artifactType)
     * @param {boolean} suffix Whether or not to expect the artifactType as the suffix
     * (ex. the "foo" repository is FooRepository)
     * @param {string[]} files An array of fake filepaths to test with
     */
    function verifyArtifactList(artifactType, folder, suffix, files) {
      const reader = () => {
        return files;
      };
      const artifactPath = path.join('tmp', 'app', folder);
      return utils.getArtifactList(artifactPath, artifactType, suffix, reader);
    }
  });
});
