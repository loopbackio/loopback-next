require('mocha');
const expect = require('@loopback/testlab').expect;
const utils = require('../lib/utils');

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
        /name cannot be empty/
      );
      testValidateName(
        'if the class name is null',
        null,
        /name cannot be empty/
      );
      testValidateName(
        'if the first character is a digit',
        '2Controller',
        /name cannot start with a number/
      );
      testValidateName(
        'if the class name contains a period',
        'Cool.App',
        /name cannot contain \./
      );
      testValidateName(
        'if the class name contains special characters',
        'Foo%bar',
        /name cannot contain special character/
      );
      testValidateName(
        'if the class name contain two or more words',
        'foo bar',
        /name cannot contain special character/
      );
      testValidateName(
        'if the class name contains other invalid symbols',
        'foo♡bar',
        /name is invalid/
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
        'foo2bar'
      );
      testCorrectName(
        'if the class name contains non-English letter',
        'fooβbar'
      );
      testCorrectName(
        'if the first character has an accented character',
        'Óoobar'
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
        'ÓooBar'
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
  describe('toFileName', () => {
    describe('should error', () => {
      testExpectError('if input is empty', '', /no input/);
      testExpectError('if input is null', null, /bad input/);
      testExpectError('if input is not a string', 42, /bad input/);
    });
    describe('should have no effect', () => {
      testExpectNoChange('if first letter is lower case', 'fooBar');
      testExpectNoChange('if first letter is not convertible', '$fooBar');
    });
    describe('should convert first letter to lower case', () => {
      testExpectLowerCase('if first letter is upper case', 'FooBar', 'fooBar');
      testExpectLowerCase(
        'if first letter is upper case in different language',
        'ÓooBar',
        'óooBar'
      );
    });
    function testExpectError(testName, input, expected) {
      it(testName, () => {
        expect(utils.toFileName(input)).to.match(expected);
      });
    }
    function testExpectNoChange(testName, input) {
      it(testName, () => {
        expect(utils.toFileName(input)).to.equal(input);
      });
    }
    function testExpectLowerCase(testName, input, expected) {
      it(testName, () => {
        expect(utils.toFileName(input)).to.equal(expected);
      });
    }
  });
});
