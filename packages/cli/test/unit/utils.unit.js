// Copyright IBM Corp. 2018,2019. All Rights Reserved.
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
    });

    describe('should capitalize first letter', () => {
      testExpect('if first letter is not convertible', '$fooBar', 'FooBar');
      testExpect('if first letter is lower case', 'fooBar', 'FooBar');
      testExpect(
        'if first letter is lower case in different language',
        'óooBar',
        'ÓooBar',
      );
    });

    describe('should use pascal case ', () => {
      testExpect(
        'if second letter starts with multiple upper case chars',
        'myDSDataSource',
        'MyDsDataSource',
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

    function testExpect(testName, input, expected) {
      it(testName, () => {
        expect(utils.toClassName(input)).to.equal(expected);
      });
    }
  });

  describe('validateUrlSlug', () => {
    it('returns true for slug in plural form', () => {
      expect(utils.validateUrlSlug('foos')).to.be.true();
    });

    it('returns true for slug in camelCase', () => {
      expect(utils.validateUrlSlug('fooBar')).to.be.true();
    });

    it('returns true for slug with lower and upper case letters', () => {
      expect(utils.validateUrlSlug('fOoBaR')).to.be.true();
    });

    it('returns true for slugs separated by underscores', () => {
      expect(utils.validateUrlSlug('foo_Bar')).to.be.true();
    });

    it('returns true for slug with backslash in front', () => {
      expect(utils.validateUrlSlug('/foo-bar')).to.be.true();
    });

    it('does not validate an invalid url slug', () => {
      expect(utils.validateUrlSlug('foo#bars')).to.match(
        /Suggested slug: foo-bars/,
      );
      expect(utils.validateUrlSlug('foo bar')).to.match(
        /Suggested slug: foo-bar/,
      );
      expect(utils.validateUrlSlug('/foo&bar')).to.match(
        /Suggested slug: \/foo-bar/,
      );
      expect(utils.validateUrlSlug('//foo-bar')).to.match(
        /Suggested slug: \/foo-bar/,
      );
      expect(utils.validateUrlSlug('/foo-bar/')).to.match(
        /Suggested slug: \/foo-bar/,
      );
      expect(utils.validateUrlSlug('foo-bar/')).to.match(
        /Suggested slug: foo-bar/,
      );
    });
  });

  describe('prependBackslash', () => {
    it('appends backslash if given word does not have any', () => {
      expect(utils.prependBackslash('product-review')).to.eql(
        '/product-review',
      );
    });

    it('does nothing if given word already has a backslash', () => {
      expect(utils.prependBackslash('/product-review')).to.eql(
        '/product-review',
      );
    });
  });

  describe('findArtifactPaths', () => {
    it('returns all matching paths of type', async () => {
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

      const results = await utils.findArtifactPaths(
        path.join('fake', 'path'),
        'model',
        reader,
      );
      expect(results).to.eql(expected);
    });
  });
  describe('getArtifactList', () => {
    const expectedModels = ['Foo', 'Bar'];
    const expectedRepos = ['FooRepository', 'BarRepository'];
    it('finds JS models', async () => {
      const files = [
        path.join('tmp', 'app', 'foo.model.js'),
        path.join('tmp', 'app', 'bar.model.js'),
        path.join('tmp', 'app', 'README.md'),
      ];
      const results = await verifyArtifactList('model', 'models', false, files);
      expect(results).to.eql(expectedModels);
    });

    it('finds TS models', async () => {
      const files = [
        path.join('tmp', 'app', 'foo.model.ts'),
        path.join('tmp', 'app', 'bar.model.ts'),
        path.join('tmp', 'app', 'README.md'),
      ];
      const results = await verifyArtifactList('model', 'models', false, files);
      expect(results).to.eql(expectedModels);
    });

    it('finds JS repositories', async () => {
      const files = [
        path.join('tmp', 'app', 'foo.repository.js'),
        path.join('tmp', 'app', 'bar.repository.js'),
        path.join('tmp', 'app', 'foo.model.js'),
      ];
      const results = await verifyArtifactList(
        'repository',
        'repositories',
        true,
        files,
        expectedRepos,
      );
      expect(results).to.eql(expectedRepos);
    });

    it('finds TS repositories', async () => {
      const files = [
        path.join('tmp', 'app', 'foo.repository.ts'),
        path.join('tmp', 'app', 'bar.repository.ts'),
        path.join('tmp', 'app', 'foo.model.ts'),
      ];
      const results = await verifyArtifactList(
        'repository',
        'repositories',
        true,
        files,
        expectedRepos,
      );
      expect(results).to.eql(expectedRepos);
    });

    it('finds artifacts with hyphens in their names', async () => {
      const files = [
        path.join('tmp', 'app', 'foo-bar.model.js'),
        path.join('tmp', 'app', 'baz.model.js'),
        path.join('tmp', 'app', 'README.md'),
      ];
      const results = await verifyArtifactList('model', 'models', false, files);
      expect(results).to.eql(['FooBar', 'Baz']);
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
    async function verifyArtifactList(artifactType, folder, suffix, files) {
      const reader = () => {
        return files;
      };
      const artifactPath = path.join('tmp', 'app', folder);
      return await utils.getArtifactList(
        artifactPath,
        artifactType,
        suffix,
        reader,
      );
    }
  });

  describe('validateStringObject', () => {
    it('returns true for an object check with a null value', () => {
      expect(utils.validateStringObject('object')(null)).to.be.True();
    });

    it('returns true for an array check with a null value', () => {
      expect(utils.validateStringObject('array')(null)).to.be.True();
    });

    it('returns string for an object check with an empty string', () => {
      expect(utils.validateStringObject('object')('')).to.be.True();
    });

    it('returns string for an array check with an empty string', () => {
      expect(utils.validateStringObject('array')('')).to.be.True();
    });

    it('returns true for an object check with undefined', () => {
      expect(utils.validateStringObject('object')(undefined)).to.be.eql(
        'The value must be a stringified object',
      );
    });

    it('returns true for an array check with undefined', () => {
      expect(utils.validateStringObject('array')(undefined)).to.be.eql(
        'The value must be a stringified array',
      );
    });

    it('returns string for an object check with a number', () => {
      expect(utils.validateStringObject('object')(123)).to.be.eql(
        'The value must be a stringified object',
      );
    });

    it('returns string for an array check with a number', () => {
      expect(utils.validateStringObject('array')(123)).to.be.eql(
        'The value must be a stringified array',
      );
    });

    it('returns string for an object check with an object', () => {
      expect(utils.validateStringObject('object')({})).to.be.eql(
        'The value must be a stringified object',
      );
    });

    it('returns string for an array check with a number', () => {
      expect(utils.validateStringObject('array')({})).to.be.eql(
        'The value must be a stringified array',
      );
    });

    it('returns true for an object check with an object', () => {
      expect(utils.validateStringObject('object')('{}')).to.be.True();
    });

    it('returns string for an array check with an object', () => {
      expect(utils.validateStringObject('array')('{}')).to.be.eql(
        'The value must be a stringified array',
      );
    });

    it('returns string for an object check with an array', () => {
      expect(utils.validateStringObject('object')('[1, 2, 3]')).to.be.True();
    });

    it('returns true for an array check with an array', () => {
      expect(utils.validateStringObject('array')('[1, 2, 3]')).to.be.True();
    });
  });

  describe('getDataSourceName', () => {
    it('returns false on missing dataSourceClass parameter', () => {
      expect(utils.getDataSourceName('src/datasources')).to.be.False();
    });
  });

  describe('getDataSourceConnectorName', () => {
    it('returns false on missing dataSourceClass parameter', () => {
      expect(utils.getDataSourceConnectorName('src/datasources')).to.be.False();
    });
  });

  describe('isConnectorOfType', () => {
    it('returns false on missing dataSourceClass parameter', () => {
      expect(
        utils.isConnectorOfType('src/datasources', 'PersistedModel'),
      ).to.be.False();
    });
  });

  describe('getServiceFileName', () => {
    it('returns the file class name', () => {
      expect(utils.getServiceFileName('MyService')).to.equal(
        'my-service.service.ts',
      );
    });
  });

  describe('dataSourceToJSONFileName', () => {
    it('returns the datasource json file name', () => {
      expect(utils.dataSourceToJSONFileName('MapDS')).to.equal(
        'map-ds.datasource.json',
      );
    });
  });
});
