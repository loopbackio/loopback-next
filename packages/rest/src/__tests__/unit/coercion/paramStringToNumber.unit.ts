// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ParameterLocation} from '@loopback/openapi-v3';
import {RestHttpErrors} from '../../../';
import {test} from './utils';

const NUMBER_PARAM = {
  in: <ParameterLocation>'path',
  name: 'aparameter',
  schema: {type: 'number'},
};

const REQUIRED_NUMBER_PARAM = {
  in: <ParameterLocation>'path',
  name: 'aparameter',
  schema: {type: 'number'},
  required: true,
};

const FLOAT_PARAM = {
  in: <ParameterLocation>'path',
  name: 'aparameter',
  schema: {
    type: 'number',
    format: 'float',
  },
};

const DOUBLE_PARAM = {
  in: <ParameterLocation>'path',
  name: 'aparameter',
  schema: {
    type: 'number',
    format: 'double',
  },
};

describe('coerce param from string to number - required', () => {
  context('valid values', () => {
    test(REQUIRED_NUMBER_PARAM, '0', 0);
    test(REQUIRED_NUMBER_PARAM, '1', 1);
    test(REQUIRED_NUMBER_PARAM, '-1', -1);
  });

  context('empty values trigger ERROR_BAD_REQUEST', () => {
    // null, '' sent from request are converted to raw value ''
    test(
      REQUIRED_NUMBER_PARAM,
      '',
      RestHttpErrors.missingRequired(REQUIRED_NUMBER_PARAM.name),
    );
  });
});

describe('coerce param from string to number - optional', () => {
  context('valid values', () => {
    test(NUMBER_PARAM, '0', 0);
    test(NUMBER_PARAM, '1', 1);
    test(NUMBER_PARAM, '-1', -1);
    test(NUMBER_PARAM, '1.2', 1.2);
    test(NUMBER_PARAM, '-1.2', -1.2);
  });

  context('numbers larger than MAX_SAFE_INTEGER get trimmed', () => {
    test(NUMBER_PARAM, '2343546576878989879789', 2.34354657687899e21);
    test(NUMBER_PARAM, '-2343546576878989879789', -2.34354657687899e21);
  });

  context('scientific notations', () => {
    test(NUMBER_PARAM, '1.234e+30', 1.234e30);
    test(NUMBER_PARAM, '-1.234e+30', -1.234e30);
  });

  context('empty collection converts to undefined', () => {
    // [], {} sent from request are converted to raw value undefined
    test(NUMBER_PARAM, undefined, undefined);
  });

  // @jannyhou For review: shall we convert empty value to 0 or throw error?
  context('empty values trigger ERROR_BAD_REQUEST', () => {
    // null, '' sent from request are converted to raw value ''
    test(NUMBER_PARAM, '', RestHttpErrors.invalidData('', NUMBER_PARAM.name));
  });

  context('All other non-number values trigger ERROR_BAD_REQUEST', () => {
    // 'false', false, 'true', true, 'text' sent from request are converted to a string
    test(
      NUMBER_PARAM,
      'text',
      RestHttpErrors.invalidData('text', NUMBER_PARAM.name),
    );
    // {a: true}, [1,2] are converted to object
    test(
      NUMBER_PARAM,
      {a: true},
      RestHttpErrors.invalidData({a: true}, NUMBER_PARAM.name),
    );
  });
});

describe('OAI3 primitive types', () => {
  test(FLOAT_PARAM, '3.333333', 3.333333);
  test(DOUBLE_PARAM, '3.3333333333', 3.3333333333);
});
