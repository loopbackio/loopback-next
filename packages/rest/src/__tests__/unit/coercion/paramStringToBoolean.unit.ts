// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ParameterLocation} from '@loopback/openapi-v3';
import {RestHttpErrors} from '../../../';
import {test} from './utils';

const BOOLEAN_PARAM = {
  in: <ParameterLocation>'path',
  name: 'aparameter',
  schema: {type: 'boolean'},
};

const REQUIRED_BOOLEAN_PARAM = {
  in: <ParameterLocation>'path',
  name: 'aparameter',
  schema: {type: 'boolean'},
  required: true,
};

describe('coerce param from string to boolean - required', function() {
  context('valid values', () => {
    test(REQUIRED_BOOLEAN_PARAM, 'false', false);
    test(REQUIRED_BOOLEAN_PARAM, 'true', true);
    test(REQUIRED_BOOLEAN_PARAM, 'FALSE', false);
    test(REQUIRED_BOOLEAN_PARAM, 'TRUE', true);
    test(REQUIRED_BOOLEAN_PARAM, '0', false);
    test(REQUIRED_BOOLEAN_PARAM, '1', true);
  });

  context('empty values trigger ERROR_BAD_REQUEST', () => {
    // null, '' sent from request are converted to raw value ''
    test(
      REQUIRED_BOOLEAN_PARAM,
      '',
      RestHttpErrors.missingRequired(REQUIRED_BOOLEAN_PARAM.name),
    );
  });
});

describe('coerce param from string to boolean - optional', function() {
  context('valid values', () => {
    test(BOOLEAN_PARAM, 'false', false);
    test(BOOLEAN_PARAM, 'true', true);
    test(BOOLEAN_PARAM, 'FALSE', false);
    test(BOOLEAN_PARAM, 'TRUE', true);
    test(BOOLEAN_PARAM, '0', false);
    test(BOOLEAN_PARAM, '1', true);
  });

  context('invalid values should trigger ERROR_BAD_REQUEST', () => {
    test(
      BOOLEAN_PARAM,
      'text',
      RestHttpErrors.invalidData('text', BOOLEAN_PARAM.name),
    );
    test(
      BOOLEAN_PARAM,
      'null',
      RestHttpErrors.invalidData('null', BOOLEAN_PARAM.name),
    );
    // {a: true}, [1,2] are converted to object
    test(
      BOOLEAN_PARAM,
      {a: true},
      RestHttpErrors.invalidData({a: true}, BOOLEAN_PARAM.name),
    );
  });

  context('empty collection converts to undefined', () => {
    test(BOOLEAN_PARAM, undefined, undefined);
  });

  context('empty values trigger ERROR_BAD_REQUEST', () => {
    // null, '' sent from request are converted to raw value ''
    test(BOOLEAN_PARAM, '', RestHttpErrors.invalidData('', BOOLEAN_PARAM.name));
  });
});
