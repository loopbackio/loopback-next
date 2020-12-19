// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ParameterObject} from '@loopback/openapi-v3';
import {RestHttpErrors} from '../../..';
import {test} from './utils';

const OPTIONAL_STRING_PARAM: ParameterObject = {
  in: 'path',
  name: 'aparameter',
  schema: {type: 'string'},
};

const REQUIRED_STRING_PARAM: ParameterObject = {
  ...OPTIONAL_STRING_PARAM,
  required: true,
};

const ENUM_STRING_PARAM: ParameterObject = {
  in: 'query',
  name: 'aparameter',
  schema: {type: 'string', enum: ['A', 'B']},
};

describe('coerce param from string to string - required', () => {
  context('valid values', () => {
    test(REQUIRED_STRING_PARAM, 'text', 'text');
  });

  context('empty values trigger ERROR_BAD_REQUEST', () => {
    // null, '' sent from request are converted to raw value ''
    test(
      REQUIRED_STRING_PARAM,
      '',
      RestHttpErrors.missingRequired(REQUIRED_STRING_PARAM.name),
    );
  });
});

describe('coerce param from string to string - enum', () => {
  context('valid values', () => {
    test(ENUM_STRING_PARAM, 'A', 'A');
  });

  context('invalid values trigger ERROR_BAD_REQUEST', () => {
    const expectedError = RestHttpErrors.invalidData(
      'C',
      ENUM_STRING_PARAM.name,
    );
    expectedError.details = [
      {
        path: '',
        code: 'enum',
        message: 'must be equal to one of the allowed values',
        info: {allowedValues: ['A', 'B']},
      },
    ];

    test(ENUM_STRING_PARAM, 'C', expectedError);
  });
});

describe('coerce param from string to string - optional', () => {
  context('valid values', () => {
    test(OPTIONAL_STRING_PARAM, 'text', 'text');
  });

  context('number-like strings are preserved as strings', () => {
    // octal (base 8)
    test(OPTIONAL_STRING_PARAM, '0664', '0664');

    // integers that cannot be repesented by JavaScript's number
    test(
      OPTIONAL_STRING_PARAM,
      '2343546576878989879789',
      '2343546576878989879789',
    );
    test(
      OPTIONAL_STRING_PARAM,
      '-2343546576878989879789',
      '-2343546576878989879789',
    );

    // scientific notation
    test(OPTIONAL_STRING_PARAM, '1.234e+30', '1.234e+30');
    test(OPTIONAL_STRING_PARAM, '-1.234e+30', '-1.234e+30');
  });

  context('empty collection converts to undefined', () => {
    // [], {} sent from request are converted to raw value undefined
    test(OPTIONAL_STRING_PARAM, undefined, undefined);
  });

  context('empty values are allowed', () => {
    // null, '' sent from request are converted to raw value ''
    test(OPTIONAL_STRING_PARAM, '', '');
    test(OPTIONAL_STRING_PARAM, 'null', 'null');
    test(OPTIONAL_STRING_PARAM, 'undefined', 'undefined');
  });

  context('object values trigger ERROR_BAD_REQUEST', () => {
    test(
      OPTIONAL_STRING_PARAM,
      {a: true},
      RestHttpErrors.invalidData({a: true}, OPTIONAL_STRING_PARAM.name),
    );

    test(
      OPTIONAL_STRING_PARAM,
      [1, 2, 3],
      RestHttpErrors.invalidData([1, 2, 3], OPTIONAL_STRING_PARAM.name),
    );
  });
});
