// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ParameterLocation} from '@loopback/openapi-v3';
import {RestHttpErrors} from '../../../';
import {test} from './utils';

const INT32_PARAM = {
  in: <ParameterLocation>'path',
  name: 'aparameter',
  schema: {type: 'integer', format: 'int32'},
};

const INT64_PARAM = {
  in: <ParameterLocation>'path',
  name: 'aparameter',
  schema: {type: 'integer', format: 'int64'},
};

const REQUIRED_INTEGER_PARAM = {
  in: <ParameterLocation>'path',
  name: 'aparameter',
  schema: {type: 'integer'},
  required: true,
};

const INTEGER_PARAM = {
  in: <ParameterLocation>'path',
  name: 'aparameter',
  schema: {type: 'integer'},
};

describe('coerce param from string to integer', () => {
  test(INT32_PARAM, '100', 100);
  test(INT64_PARAM, '9223372036854775807', 9223372036854775807);
});

describe('coerce param from string to integer - required', function() {
  context('valid values', () => {
    test(REQUIRED_INTEGER_PARAM, '0', 0);
    test(REQUIRED_INTEGER_PARAM, '1', 1);
    test(REQUIRED_INTEGER_PARAM, '-1', -1);
  });

  context('empty values trigger ERROR_BAD_REQUEST', () => {
    // null, '' sent from request are converted to raw value ''
    test(
      REQUIRED_INTEGER_PARAM,
      '',
      RestHttpErrors.missingRequired(REQUIRED_INTEGER_PARAM.name),
    );
  });
});

describe('coerce param from string to integer - optional', function() {
  context('valid values', () => {
    test(INTEGER_PARAM, '0', 0);
    test(INTEGER_PARAM, '1', 1);
    test(INTEGER_PARAM, '-1', -1);
  });

  context(
    'integers larger than MAX_SAFE_INTEGER should trigger ERROR_BAD_REQUEST',
    () => {
      test(
        INTEGER_PARAM,
        '2343546576878989879789',
        RestHttpErrors.invalidData(
          '2343546576878989879789',
          REQUIRED_INTEGER_PARAM.name,
        ),
      );
      test(
        INTEGER_PARAM,
        '-2343546576878989879789',
        RestHttpErrors.invalidData(
          '-2343546576878989879789',
          REQUIRED_INTEGER_PARAM.name,
        ),
      );
      test(
        INTEGER_PARAM,
        '1.234e+30',
        RestHttpErrors.invalidData('1.234e+30', REQUIRED_INTEGER_PARAM.name),
      );
      test(
        INTEGER_PARAM,
        '-1.234e+30',
        RestHttpErrors.invalidData('-1.234e+30', REQUIRED_INTEGER_PARAM.name),
      );
    },
  );

  context('scientific notations', () => {
    test(INTEGER_PARAM, '1.234e+3', 1.234e3);
    test(INTEGER_PARAM, '-1.234e+3', -1.234e3);
  });

  context('integer-like string values should trigger ERROR_BAD_REQUEST', () => {
    test(
      INTEGER_PARAM,
      '1.2',
      RestHttpErrors.invalidData('1.2', INTEGER_PARAM.name),
    );
    test(
      INTEGER_PARAM,
      '-1.2',
      RestHttpErrors.invalidData('-1.2', INTEGER_PARAM.name),
    );
  });

  context('empty collection converts to undefined', () => {
    // [], {} sent from request are converted to raw value undefined
    test(INTEGER_PARAM, undefined, undefined);
  });

  context('empty values trigger ERROR_BAD_REQUEST', () => {
    // null, '' sent from request are converted to raw value ''
    test(INTEGER_PARAM, '', RestHttpErrors.invalidData('', INTEGER_PARAM.name));
  });

  context(
    'all other non-integer values should trigger ERROR_BAD_REQUEST',
    () => {
      // 'false', false, 'true', true, 'text' sent from request are converted to a string
      test(
        INTEGER_PARAM,
        'text',
        RestHttpErrors.invalidData('text', INTEGER_PARAM.name),
      );
      // {a: true}, [1,2] are converted to object
      test(
        INTEGER_PARAM,
        {a: true},
        RestHttpErrors.invalidData({a: true}, INTEGER_PARAM.name),
      );
    },
  );
});
