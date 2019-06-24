// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ParameterLocation} from '@loopback/openapi-v3';
import {RestHttpErrors} from '../../../';
import {test} from './utils';

const DATETIME_PARAM = {
  in: <ParameterLocation>'path',
  name: 'aparameter',
  schema: {type: 'string', format: 'date-time'},
};

const REQUIRED_DATETIME_PARAM = {
  in: <ParameterLocation>'path',
  name: 'aparameter',
  schema: {type: 'string', format: 'date-time'},
  required: true,
};

describe('coerce param from string to date - required', function() {
  context('valid values', () => {
    test(
      REQUIRED_DATETIME_PARAM,
      '2016-05-19T13:28:51Z',
      new Date('2016-05-19T13:28:51Z'),
    );
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

describe('coerce param from string to date - optional', function() {
  context('valid values', () => {
    test(
      DATETIME_PARAM,
      '2016-05-19T13:28:51Z',
      new Date('2016-05-19T13:28:51Z'),
    );
    test(
      DATETIME_PARAM,
      '2016-05-19t13:28:51z',
      new Date('2016-05-19t13:28:51z'),
    );
    test(
      DATETIME_PARAM,
      '2016-05-19T13:28:51.299Z',
      new Date('2016-05-19T13:28:51.299Z'),
    );
    test(
      DATETIME_PARAM,
      '2016-05-19T13:28:51-08:00',
      new Date('2016-05-19T13:28:51-08:00'),
    );
    test(
      DATETIME_PARAM,
      '2016-05-19T13:28:51.299-08:00',
      new Date('2016-05-19T13:28:51.299-08:00'),
    );
  });

  context('invalid values should trigger ERROR_BAD_REQUEST', () => {
    test(
      DATETIME_PARAM,
      '2016-01-01',
      RestHttpErrors.invalidData('2016-01-01', DATETIME_PARAM.name),
    );
    test(
      DATETIME_PARAM,
      '2016-04-32T13:28:51Z',
      RestHttpErrors.invalidData('2016-04-32T13:28:51Z', DATETIME_PARAM.name),
    );
  });

  context('empty values trigger ERROR_BAD_REQUEST', () => {
    // null, '' sent from request are converted to raw value ''
    test(
      DATETIME_PARAM,
      '',
      RestHttpErrors.invalidData('', DATETIME_PARAM.name),
    );
  });

  context('empty collection converts to undefined', () => {
    // [], {} sent from request are converted to raw value undefined
    test(DATETIME_PARAM, undefined, undefined);
  });

  context('All other non-date values trigger ERROR_BAD_REQUEST', () => {
    // 'false', false, 'true', true, 'text' sent from request are converted to a string
    test(
      DATETIME_PARAM,
      'text',
      RestHttpErrors.invalidData('text', DATETIME_PARAM.name),
    );
    // {a: true}, [1,2] are converted to object
    test(
      DATETIME_PARAM,
      {a: true},
      RestHttpErrors.invalidData({a: true}, DATETIME_PARAM.name),
    );
  });
});
