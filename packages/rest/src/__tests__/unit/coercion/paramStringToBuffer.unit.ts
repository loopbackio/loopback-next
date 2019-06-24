// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ParameterLocation} from '@loopback/openapi-v3';
import {RestHttpErrors} from '../../..';
import {test} from './utils';

const BUFFER_PARAM = {
  in: <ParameterLocation>'path',
  name: 'aparameter',
  schema: {type: 'string', format: 'byte'},
};

const REQUIRED_BUFFER_PARAM = {
  in: <ParameterLocation>'path',
  name: 'aparameter',
  schema: {type: 'string', format: 'byte'},
  required: true,
};

describe('coerce param from string to buffer - required', () => {
  context('valid value', () => {
    const testValues = {
      base64: Buffer.from('Hello World').toString('base64'),
    };

    test(
      BUFFER_PARAM,
      testValues.base64,
      Buffer.from(testValues.base64, 'base64'),
    );
  });

  context('empty values trigger ERROR_BAD_REQUEST', () => {
    // null, '' sent from request are converted to raw value ''
    test(
      REQUIRED_BUFFER_PARAM,
      '',
      RestHttpErrors.missingRequired(REQUIRED_BUFFER_PARAM.name),
    );
  });
});

describe('coerce param from string to buffer - optional', () => {
  context('valid values', () => {
    const testValues = {
      base64: Buffer.from('Hello World').toString('base64'),
    };

    test(
      BUFFER_PARAM,
      testValues.base64,
      Buffer.from(testValues.base64, 'base64'),
    );
  });

  context('empty collection converts to undefined', () => {
    // [], {} sent from request are converted to raw value undefined
    test(BUFFER_PARAM, undefined, undefined);
  });
});
