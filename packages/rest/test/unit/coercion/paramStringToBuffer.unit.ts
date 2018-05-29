// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {test} from './utils';
import {ParameterLocation} from '@loopback/openapi-v3-types';

const BUFFER_PARAM = {
  in: <ParameterLocation>'path',
  name: 'aparameter',
  schema: {type: 'string', format: 'byte'},
};

describe('coerce param from string to buffer', () => {
  const testValues = {
    base64: Buffer.from('Hello World').toString('base64'),
  };

  test(
    BUFFER_PARAM,
    testValues.base64,
    Buffer.from(testValues.base64, 'base64'),
  );
});
