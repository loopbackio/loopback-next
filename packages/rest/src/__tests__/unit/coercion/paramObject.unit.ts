// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ParameterObject} from '@loopback/openapi-v3';
import * as qs from 'qs';
import {RestHttpErrors} from '../../..';
import {test} from './utils';

const OPTIONAL_ANY_OBJECT: ParameterObject = {
  in: 'query',
  name: 'aparameter',
  schema: {
    type: 'object',
    additionalProperties: true,
  },
  style: 'deepObject',
  explode: true,
};

const REQUIRED_ANY_OBJECT = {
  ...OPTIONAL_ANY_OBJECT,
  required: true,
};

describe('coerce object param - required', function() {
  context('valid values', () => {
    // Use JSON-encoded style, qs.stringify() omits empty objects
    test(REQUIRED_ANY_OBJECT, '{}', {});
    test(REQUIRED_ANY_OBJECT, {key: 'value'}, {key: 'value'});

    test(REQUIRED_ANY_OBJECT, {key: 'undefined'}, {key: 'undefined'});
    test(REQUIRED_ANY_OBJECT, {key: 'null'}, {key: 'null'});
    test(REQUIRED_ANY_OBJECT, {key: 'text'}, {key: 'text'});
  });

  context('empty values trigger ERROR_BAD_REQUEST', () => {
    test(
      REQUIRED_ANY_OBJECT,
      undefined, // the parameter is missing
      RestHttpErrors.missingRequired(REQUIRED_ANY_OBJECT.name),
    );

    test(
      REQUIRED_ANY_OBJECT,
      '', // ?param=
      RestHttpErrors.missingRequired(REQUIRED_ANY_OBJECT.name),
    );

    test(
      REQUIRED_ANY_OBJECT,
      'null', // ?param=null
      RestHttpErrors.missingRequired(REQUIRED_ANY_OBJECT.name),
    );
  });

  context('array values are not allowed', () => {
    // JSON encoding
    testInvalidDataError('[]');
    testInvalidDataError('[1,2]');

    // deepObject style
    testInvalidDataError([1, 2]);
  });

  function testInvalidDataError<Props extends object = {}>(
    input: string | object,
    extraErrorProps?: Props,
  ) {
    test(
      REQUIRED_ANY_OBJECT,
      input,
      RestHttpErrors.invalidData(
        createInvalidDataInput(input),
        REQUIRED_ANY_OBJECT.name,
        extraErrorProps,
      ),
    );
  }
});

describe('coerce object param - optional', function() {
  context('valid values', () => {
    // Use JSON-encoded style, qs.stringify() omits empty objects
    test(OPTIONAL_ANY_OBJECT, '{}', {});
    test(OPTIONAL_ANY_OBJECT, {key: 'value'}, {key: 'value'});
    test(OPTIONAL_ANY_OBJECT, undefined, undefined);
    test(OPTIONAL_ANY_OBJECT, '', undefined);
    test(OPTIONAL_ANY_OBJECT, 'null', null);
  });

  context('nested values are not coerced', () => {
    test(OPTIONAL_ANY_OBJECT, {key: 'undefined'}, {key: 'undefined'});
    test(OPTIONAL_ANY_OBJECT, {key: 'null'}, {key: 'null'});
    test(OPTIONAL_ANY_OBJECT, {key: 'text'}, {key: 'text'});
    test(OPTIONAL_ANY_OBJECT, {key: '0'}, {key: '0'});
    test(OPTIONAL_ANY_OBJECT, {key: '1'}, {key: '1'});
    test(OPTIONAL_ANY_OBJECT, {key: '-1'}, {key: '-1'});
    test(OPTIONAL_ANY_OBJECT, {key: '1.2'}, {key: '1.2'});
    test(OPTIONAL_ANY_OBJECT, {key: '-1.2'}, {key: '-1.2'});
    test(OPTIONAL_ANY_OBJECT, {key: 'true'}, {key: 'true'});
    test(OPTIONAL_ANY_OBJECT, {key: 'false'}, {key: 'false'});
    test(
      OPTIONAL_ANY_OBJECT,
      {key: '2016-05-19T13:28:51.299Z'},
      {key: '2016-05-19T13:28:51.299Z'},
    );
  });

  context('invalid values should trigger ERROR_BAD_REQUEST', () => {
    testInvalidDataError('text', {
      details: {
        syntaxError: 'Unexpected token e in JSON at position 1',
      },
    });

    testInvalidDataError('0');
    testInvalidDataError('1');
  });

  context('array values are not allowed', () => {
    testInvalidDataError('[]');
    testInvalidDataError('[1,2]');
    testInvalidDataError([1, 2]);
  });

  function testInvalidDataError<Props extends object = {}>(
    input: string | object,
    extraErrorProps?: Props,
  ) {
    test(
      OPTIONAL_ANY_OBJECT,
      input,
      RestHttpErrors.invalidData(
        createInvalidDataInput(input),
        OPTIONAL_ANY_OBJECT.name,
        extraErrorProps,
      ),
    );
  }
});

function createInvalidDataInput(input: string | object) {
  if (typeof input === 'string') return input;

  // convert deep property values to strings, that's what our parser
  // is going to receive on input and show in the error message
  return qs.parse(qs.stringify({value: input})).value;
}
