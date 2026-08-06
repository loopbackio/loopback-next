// Copyright IBM Corp. and LoopBack contributors 2018,2019. All Rights Reserved.
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
        'if the class name contains accented characters',
        'Óoobãr',
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
        'óooBãr',
        'OooBar',
      );
    });

    describe('should remove underscores', () => {
      testExpect('if first letter is underscore', '_fooBar', 'FooBar');
      testExpect(
        'if the class name contains a underscore in the middle',
        'foo_Bar',
        'FooBar',
      );
      testExpect(
        'if the class name contains more than one underscores',
        'foo__b_ar',
        'FooBAr',
      );
      testExpect(
        'if the class name contains underscores and digits',
        'foo_1b_ar',
        'Foo1BAr',
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
  describe('toFileName', () => {
    describe('should error', () => {
      testExpectError('if input is empty', '', /no input/);
      testExpectError('if input is null', null, /bad input/);
      testExpectError('if input is not a string', 42, /bad input/);
    });

    describe('should replace underscores with dash', () => {
      testExpect('if first letter is underscore', '_foobar', 'foobar');
      testExpect(
        'if the class name contains a underscore in the middle',
        'foo_Bar',
        'foo-bar',
      );
      testExpect(
        'if the class name contains more than one underscores',
        'foo__b_ar',
        'foo-b-ar',
      );
    });

    describe('should use dash to seperate words', () => {
      testExpect('first letter is upper case', 'Foobar', 'foobar');
      testExpect(
        'if the name contains upper case letters',
        'FooBar',
        'foo-bar',
      );
      testExpect(
        'if the name contains upper case letters',
        'FOoBAR',
        'f-oo-bar',
      );
    });

    describe('should use dash to seperate digits and words', () => {
      testExpect(
        'if the class name contains a digit in the middle',
        'Car4Share',
        'car-4-share',
      );
      testExpect('if the class name ends with a digit', 'FooBar1', 'foo-bar1');
      testExpect(
        'if the class name ends with digits',
        'Car4share12',
        'car-4-share12',
      );
    });

    function testExpectError(testName, input, expected) {
      it(testName, () => {
        expect(utils.toClassName(input)).to.match(expected);
      });
    }

    function testExpect(testName, input, expected) {
      it(testName, () => {
        expect(utils.toFileName(input)).to.equal(expected);
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

  describe('validateKeyToKeyFrom', () => {
    it('does not validate an invalid input', () => {
      expect(
        utils.validateKeyToKeyFrom('relationName', 'relationName'),
      ).to.match(
        /Through model cannot have two identical foreign keys: relationName/,
      );
      expect(utils.validateKeyToKeyFrom('', 'relationName')).to.match(
        /Key name cannot be empty/,
      );
      expect(utils.validateKeyToKeyFrom('2keyName', 'relationName')).to.match(
        /Key name cannot start with a number: 2keyName/,
      );
      expect(utils.validateKeyToKeyFrom('key.name', 'relationName')).to.match(
        /Key name cannot contain .: key.name/,
      );
      expect(utils.validateKeyToKeyFrom('key name', 'relationName')).to.match(
        /Key name cannot contain spaces: key name/,
      );
      expect(utils.validateKeyToKeyFrom('key-name', 'relationName')).to.match(
        /Key name cannot contain hyphens: key-name/,
      );
      expect(utils.validateKeyToKeyFrom('key@name', 'relationName')).to.match(
        'Key name cannot contain special characters (/@+%: ): key@name',
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
      return utils.getArtifactList(artifactPath, artifactType, suffix, reader);
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

    it('returns string for an array check with an object', () => {
      expect(utils.validateStringObject('array')({})).to.be.eql(
        'The value must be a stringified array',
      );
    });

    it('returns true for an object check with an object', () => {
      expect(utils.validateStringObject('object')('{}')).to.be.True();
    });

    it('returns string for an array check with an object-like string', () => {
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
        'map-ds.datasource.config.json',
      );
    });
  });

  describe('validateNotExisting', () => {
    it('returns true if directory does not exist', () => {
      expect(utils.validateNotExisting('/non/existent/path')).to.be.True();
    });

    it('returns error message if directory exists', () => {
      expect(utils.validateNotExisting(__dirname)).to.match(
        /Directory .* already exists/,
      );
    });
  });

  describe('checkPropertyName', () => {
    it('validates valid property names', () => {
      expect(utils.checkPropertyName('validName')).to.be.True();
      expect(utils.checkPropertyName('name123')).to.be.True();
      expect(utils.checkPropertyName('_privateName')).to.be.True();
    });

    it('rejects reserved keywords', () => {
      expect(utils.checkPropertyName('constructor')).to.match(
        /constructor is a reserved keyword/,
      );
    });

    it('rejects empty names', () => {
      expect(utils.checkPropertyName('')).to.match(/Name is required/);
    });

    it('rejects names with special characters', () => {
      expect(utils.checkPropertyName('name@test')).to.match(
        /Name cannot contain special characters/,
      );
    });
  });

  describe('validateRequiredName', () => {
    it('validates valid names', () => {
      expect(utils.validateRequiredName('validName')).to.be.True();
      expect(utils.validateRequiredName('name-with-dash')).to.be.True();
    });

    it('rejects empty names', () => {
      expect(utils.validateRequiredName('')).to.match(/Name is required/);
      expect(utils.validateRequiredName(null)).to.match(/Name is required/);
    });

    it('rejects names with special characters', () => {
      expect(utils.validateRequiredName('name@test')).to.match(
        /Name cannot contain special characters/,
      );
      expect(utils.validateRequiredName('name/test')).to.match(
        /Name cannot contain special characters/,
      );
      expect(utils.validateRequiredName('name test')).to.match(
        /Name cannot contain special characters/,
      );
    });
  });

  describe('getModelFileName', () => {
    it('returns correct model file name', () => {
      expect(utils.getModelFileName('MyModel')).to.equal('my-model.model.ts');
      expect(utils.getModelFileName('User')).to.equal('user.model.ts');
      expect(utils.getModelFileName('ProductReview')).to.equal(
        'product-review.model.ts',
      );
    });
  });

  describe('getRepositoryFileName', () => {
    it('returns correct repository file name', () => {
      expect(utils.getRepositoryFileName('MyRepository')).to.equal(
        'my-repository.repository.ts',
      );
      expect(utils.getRepositoryFileName('UserRepository')).to.equal(
        'user-repository.repository.ts',
      );
    });
  });

  describe('getRestConfigFileName', () => {
    it('returns correct rest config file name', () => {
      expect(utils.getRestConfigFileName('MyModel')).to.equal(
        'my-model.rest-config.ts',
      );
      expect(utils.getRestConfigFileName('Product')).to.equal(
        'product.rest-config.ts',
      );
    });
  });

  describe('getObserverFileName', () => {
    it('returns correct observer file name', () => {
      expect(utils.getObserverFileName('MyObserver')).to.equal(
        'my-observer.observer.ts',
      );
      expect(utils.getObserverFileName('LogObserver')).to.equal(
        'log-observer.observer.ts',
      );
    });
  });

  describe('getInterceptorFileName', () => {
    it('returns correct interceptor file name', () => {
      expect(utils.getInterceptorFileName('MyInterceptor')).to.equal(
        'my-interceptor.interceptor.ts',
      );
      expect(utils.getInterceptorFileName('AuthInterceptor')).to.equal(
        'auth-interceptor.interceptor.ts',
      );
    });
  });

  describe('validate npm package name', () => {
    it('validates valid package names', () => {
      expect(utils.validate('my-package')).to.be.True();
      expect(utils.validate('my-package-name')).to.be.True();
      expect(utils.validate('@scope/package')).to.be.True();
    });

    it('rejects invalid package names', () => {
      expect(utils.validate('My Package')).to.match(/Invalid npm package name/);
      expect(utils.validate('package_name')).to.match(
        /Invalid npm package name/,
      );
    });
  });

  describe('wrapLine', () => {
    it('wraps long lines at specified length', () => {
      const line = 'This is a very long line that should be wrapped';
      const wrapped = utils.wrapLine(line, 20);
      const lines = wrapped.split('\n');
      expect(lines.length).to.be.greaterThan(1);
      lines.forEach(l => {
        expect(l.length).to.be.lessThanOrEqual(20);
      });
    });

    it('does not wrap short lines', () => {
      const line = 'Short line';
      const wrapped = utils.wrapLine(line, 80);
      expect(wrapped).to.equal(line);
    });

    it('handles empty lines', () => {
      expect(utils.wrapLine('', 80)).to.equal('');
    });
  });

  describe('wrapText', () => {
    it('wraps multiple lines', () => {
      const text =
        'Line one\nLine two that is very long and should be wrapped\nLine three';
      const wrapped = utils.wrapText(text, 20);
      expect(wrapped).to.be.a.String();
      expect(wrapped.split('\n').length).to.be.greaterThan(3);
    });

    it('preserves line breaks', () => {
      const text = 'Line one\n\nLine three';
      const wrapped = utils.wrapText(text, 80);
      expect(wrapped.split('\n').length).to.equal(3);
    });
  });

  describe('isYarnAvailable', () => {
    it('returns a boolean', () => {
      const result = utils.isYarnAvailable();
      expect(result).to.be.a.Boolean();
    });

    it('caches the result', () => {
      const result1 = utils.isYarnAvailable();
      const result2 = utils.isYarnAvailable();
      expect(result1).to.equal(result2);
    });
  });

  describe('stringifyObject', () => {
    it('stringifies objects with default options', () => {
      const obj = {name: 'test', value: 123};
      const result = utils.stringifyObject(obj);
      expect(result).to.be.a.String();
      expect(result).to.match(/name: 'test'/);
      expect(result).to.match(/value: 123/);
    });

    it('uses single quotes by default', () => {
      const obj = {name: 'test'};
      const result = utils.stringifyObject(obj);
      expect(result).to.match(/'/);
    });

    it('accepts custom options', () => {
      const obj = {name: 'test'};
      const result = utils.stringifyObject(obj, {singleQuotes: false});
      expect(result).to.match(/"/);
    });
  });

  describe('stringifyModelSettings', () => {
    it('returns empty string for empty settings', () => {
      expect(utils.stringifyModelSettings({})).to.equal('');
      expect(utils.stringifyModelSettings(null)).to.equal('');
      expect(utils.stringifyModelSettings(undefined)).to.equal('');
    });

    it('stringifies model settings', () => {
      const settings = {strict: true, idInjection: false};
      const result = utils.stringifyModelSettings(settings);
      expect(result).to.be.a.String();
      expect(result).to.match(/settings:/);
      expect(result).to.match(/strict: true/);
    });
  });

  describe('pluralize', () => {
    it('pluralizes words correctly', () => {
      expect(utils.pluralize('model')).to.equal('models');
      expect(utils.pluralize('repository')).to.equal('repositories');
      expect(utils.pluralize('person')).to.equal('people');
    });

    it('handles already plural words', () => {
      expect(utils.pluralize('models')).to.equal('models');
    });
  });

  describe('camelCase', () => {
    it('converts to camelCase', () => {
      expect(utils.camelCase('my-name')).to.equal('myName');
      expect(utils.camelCase('my_name')).to.equal('myName');
      expect(utils.camelCase('MyName')).to.equal('myName');
    });
  });

  describe('pascalCase', () => {
    it('converts to PascalCase', () => {
      expect(utils.pascalCase('my-name')).to.equal('MyName');
      expect(utils.pascalCase('my_name')).to.equal('MyName');
      expect(utils.pascalCase('myName')).to.equal('MyName');
    });
  });

  describe('lowerCase', () => {
    it('converts to lower case with spaces', () => {
      expect(utils.lowerCase('MyName')).to.equal('my name');
      expect(utils.lowerCase('my-name')).to.equal('my name');
    });
  });

  describe('urlSlug', () => {
    it('converts to URL slug', () => {
      expect(utils.urlSlug('My Name')).to.equal('my-name');
      expect(utils.urlSlug('Product Review')).to.equal('product-review');
    });
  });

  describe('directory constants', () => {
    it('exports correct directory names', () => {
      expect(utils.repositoriesDir).to.equal('repositories');
      expect(utils.datasourcesDir).to.equal('datasources');
      expect(utils.servicesDir).to.equal('services');
      expect(utils.modelsDir).to.equal('models');
      expect(utils.observersDir).to.equal('observers');
      expect(utils.interceptorsDir).to.equal('interceptors');
      expect(utils.modelEndpointsDir).to.equal('model-endpoints');
      expect(utils.sourceRootDir).to.equal('src');
    });
  });
});
