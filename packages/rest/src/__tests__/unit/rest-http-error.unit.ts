// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {RestHttpErrors} from '../../rest-http-error';

describe('RestHttpErrors', () => {
  describe('invalidData()', () => {
    it('creates error with invalid data message', () => {
      const error = RestHttpErrors.invalidData({foo: 'bar'}, 'testParam');
      expect(error.message).to.equal(
        'Invalid data {"foo":"bar"} for parameter "testParam".',
      );
      expect(error.statusCode).to.equal(400);
    });

    it('includes code property', () => {
      const error = RestHttpErrors.invalidData('test', 'param');
      expect(error).to.have.property('code', 'INVALID_PARAMETER_VALUE');
    });

    it('includes parameterName property', () => {
      const error = RestHttpErrors.invalidData('test', 'myParam');
      expect(error).to.have.property('parameterName', 'myParam');
    });

    it('includes extra properties when provided', () => {
      const error = RestHttpErrors.invalidData('test', 'param', {
        customProp: 'value',
      });
      expect(error).to.have.property('customProp', 'value');
    });

    it('handles null data', () => {
      const error = RestHttpErrors.invalidData(null, 'param');
      expect(error.message).to.match(/null/);
    });

    it('handles undefined data', () => {
      const error = RestHttpErrors.invalidData(undefined, 'param');
      expect(error.message).to.match(/undefined/);
    });

    it('handles number data', () => {
      const error = RestHttpErrors.invalidData(123, 'param');
      expect(error.message).to.match(/123/);
    });

    it('handles boolean data', () => {
      const error = RestHttpErrors.invalidData(true, 'param');
      expect(error.message).to.match(/true/);
    });

    it('handles array data', () => {
      const error = RestHttpErrors.invalidData([1, 2, 3], 'param');
      expect(error.message).to.match(/\[1,2,3\]/);
    });

    it('handles complex object data', () => {
      const data = {nested: {value: 'test'}};
      const error = RestHttpErrors.invalidData(data, 'param');
      expect(error.message).to.match(/nested/);
      expect(error.message).to.match(/test/);
    });
  });

  describe('unsupportedMediaType()', () => {
    it('creates error with content type message', () => {
      const error = RestHttpErrors.unsupportedMediaType('text/plain');
      expect(error.message).to.equal(
        'Content-type text/plain is not supported.',
      );
      expect(error.statusCode).to.equal(415);
    });

    it('includes allowed types in message when provided', () => {
      const error = RestHttpErrors.unsupportedMediaType('text/plain', [
        'application/json',
        'application/xml',
      ]);
      expect(error.message).to.equal(
        'Content-type text/plain does not match [application/json,application/xml].',
      );
    });

    it('includes code property', () => {
      const error = RestHttpErrors.unsupportedMediaType('text/plain');
      expect(error).to.have.property('code', 'UNSUPPORTED_MEDIA_TYPE');
    });

    it('includes contentType property', () => {
      const error = RestHttpErrors.unsupportedMediaType('text/html');
      expect(error).to.have.property('contentType', 'text/html');
    });

    it('includes allowedMediaTypes property', () => {
      const allowed = ['application/json'];
      const error = RestHttpErrors.unsupportedMediaType('text/plain', allowed);
      expect(error).to.have.property('allowedMediaTypes', allowed);
    });

    it('handles empty allowed types array', () => {
      const error = RestHttpErrors.unsupportedMediaType('text/plain', []);
      expect(error.message).to.equal(
        'Content-type text/plain is not supported.',
      );
    });

    it('handles single allowed type', () => {
      const error = RestHttpErrors.unsupportedMediaType('text/plain', [
        'application/json',
      ]);
      expect(error.message).to.match(/application\/json/);
    });

    it('handles multiple allowed types', () => {
      const error = RestHttpErrors.unsupportedMediaType('text/plain', [
        'application/json',
        'application/xml',
        'text/html',
      ]);
      expect(error.message).to.match(/application\/json/);
      expect(error.message).to.match(/application\/xml/);
      expect(error.message).to.match(/text\/html/);
    });
  });

  describe('missingRequired()', () => {
    it('creates error with missing parameter message', () => {
      const error = RestHttpErrors.missingRequired('userId');
      expect(error.message).to.equal('Required parameter userId is missing!');
      expect(error.statusCode).to.equal(400);
    });

    it('includes code property', () => {
      const error = RestHttpErrors.missingRequired('param');
      expect(error).to.have.property('code', 'MISSING_REQUIRED_PARAMETER');
    });

    it('includes parameterName property', () => {
      const error = RestHttpErrors.missingRequired('testParam');
      expect(error).to.have.property('parameterName', 'testParam');
    });

    it('handles parameter names with special characters', () => {
      const error = RestHttpErrors.missingRequired('user-id');
      expect(error.message).to.match(/user-id/);
    });

    it('handles parameter names with spaces', () => {
      const error = RestHttpErrors.missingRequired('user name');
      expect(error.message).to.match(/user name/);
    });
  });

  describe('invalidParamLocation()', () => {
    it('creates error with invalid location message', () => {
      const error = RestHttpErrors.invalidParamLocation('cookie');
      expect(error.message).to.equal(
        'Parameters with "in: cookie" are not supported yet.',
      );
      expect(error.statusCode).to.equal(501);
    });

    it('handles different location values', () => {
      const error = RestHttpErrors.invalidParamLocation('header');
      expect(error.message).to.match(/header/);
    });

    it('handles custom location values', () => {
      const error = RestHttpErrors.invalidParamLocation('custom');
      expect(error.message).to.match(/custom/);
    });
  });

  describe('invalidRequestBody()', () => {
    it('creates error with validation details', () => {
      const details = [
        {
          path: '/name',
          code: 'required',
          message: 'must have required property name',
          info: {},
        },
      ];
      const error = RestHttpErrors.invalidRequestBody(details);
      expect(error.message).to.equal(
        RestHttpErrors.INVALID_REQUEST_BODY_MESSAGE,
      );
      expect(error.statusCode).to.equal(422);
    });

    it('includes code property', () => {
      const error = RestHttpErrors.invalidRequestBody([]);
      expect(error).to.have.property('code', 'VALIDATION_FAILED');
    });

    it('includes details property', () => {
      const details = [
        {
          path: '/email',
          code: 'format',
          message: 'must match format "email"',
          info: {format: 'email'},
        },
      ];
      const error = RestHttpErrors.invalidRequestBody(details);
      expect(error).to.have.property('details', details);
    });

    it('handles multiple validation errors', () => {
      const details = [
        {
          path: '/name',
          code: 'required',
          message: 'must have required property name',
          info: {},
        },
        {
          path: '/age',
          code: 'type',
          message: 'must be number',
          info: {type: 'number'},
        },
      ];
      const error = RestHttpErrors.invalidRequestBody(details);
      expect(error.details).to.have.length(2);
    });

    it('handles empty details array', () => {
      const error = RestHttpErrors.invalidRequestBody([]);
      expect(error.details).to.be.an.Array();
      expect(error.details).to.have.length(0);
    });

    it('preserves all detail properties', () => {
      const details = [
        {
          path: '/user/email',
          code: 'format',
          message: 'Invalid email format',
          info: {format: 'email', value: 'invalid'},
        },
      ];
      const error = RestHttpErrors.invalidRequestBody(details);
      expect(error.details[0]).to.have.property('path', '/user/email');
      expect(error.details[0]).to.have.property('code', 'format');
      expect(error.details[0]).to.have.property(
        'message',
        'Invalid email format',
      );
      expect(error.details[0].info).to.have.property('format', 'email');
      expect(error.details[0].info).to.have.property('value', 'invalid');
    });
  });

  describe('INVALID_REQUEST_BODY_MESSAGE constant', () => {
    it('has correct message', () => {
      expect(RestHttpErrors.INVALID_REQUEST_BODY_MESSAGE).to.equal(
        'The request body is invalid. See error object `details` property for more info.',
      );
    });
  });

  describe('ValidationErrorDetails interface', () => {
    it('validates structure with all required fields', () => {
      const detail: RestHttpErrors.ValidationErrorDetails = {
        path: '/field',
        code: 'required',
        message: 'Field is required',
        info: {},
      };
      expect(detail).to.have.property('path');
      expect(detail).to.have.property('code');
      expect(detail).to.have.property('message');
      expect(detail).to.have.property('info');
    });

    it('allows complex info objects', () => {
      const detail: RestHttpErrors.ValidationErrorDetails = {
        path: '/user/age',
        code: 'minimum',
        message: 'must be >= 18',
        info: {
          minimum: 18,
          actual: 15,
          comparison: '>=',
        },
      };
      expect(detail.info).to.have.property('minimum', 18);
      expect(detail.info).to.have.property('actual', 15);
    });
  });
});

// Made with Bob
