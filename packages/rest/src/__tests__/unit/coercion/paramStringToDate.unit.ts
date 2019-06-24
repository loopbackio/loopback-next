// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ParameterLocation} from '@loopback/openapi-v3';
import {RestHttpErrors} from '../../../';
import {test} from './utils';

const DATE_PARAM = {
  in: <ParameterLocation>'path',
  name: 'aparameter',
  schema: {type: 'string', format: 'date'},
};

const REQUIRED_DATETIME_PARAM = {
  in: <ParameterLocation>'path',
  name: 'aparameter',
  schema: {type: 'string', format: 'date'},
  required: true,
};

describe('coerce param from string to date - required', () => {
  context('valid values', () => {
    test(REQUIRED_DATETIME_PARAM, '2016-05-19', new Date('2016-05-19'));
  });

  context('empty values trigger ERROR_BAD_REQUEST', () => {
    // null, '' sent from request are converted to raw value ''
    test(
      REQUIRED_DATETIME_PARAM,
      '',
      RestHttpErrors.missingRequired(REQUIRED_DATETIME_PARAM.name),
    );
  });
});

describe('coerce param from string to date - optional', () => {
  context('valid values', () => {
    test(DATE_PARAM, '2015-03-01', new Date('2015-03-01'));
  });

  context('invalid values trigger ERROR_BAD_REQUEST', () => {
    test(
      DATE_PARAM,
      '2015-04-32',
      RestHttpErrors.invalidData('2015-04-32', DATE_PARAM.name),
    );
    test(
      DATE_PARAM,
      '2015-03-01T11:20:20.001Z',
      RestHttpErrors.invalidData('2015-03-01T11:20:20.001Z', DATE_PARAM.name),
    );
  });

  context('empty values trigger ERROR_BAD_REQUEST', () => {
    // null, '' sent from request are converted to raw value ''
    test(DATE_PARAM, '', RestHttpErrors.invalidData('', DATE_PARAM.name));
  });

  context('empty collection converts to undefined', () => {
    // [], {} sent from request are converted to raw value undefined
    test(DATE_PARAM, undefined, undefined);
  });

  context('All other non-date values trigger ERROR_BAD_REQUEST', () => {
    // 'false', false, 'true', true, 'text' sent from request are converted to a string
    test(
      DATE_PARAM,
      'text',
      RestHttpErrors.invalidData('text', DATE_PARAM.name),
    );
    // {a: true}, [1,2] are converted to object
    test(
      DATE_PARAM,
      {a: true},
      RestHttpErrors.invalidData({a: true}, DATE_PARAM.name),
    );
  });
});
