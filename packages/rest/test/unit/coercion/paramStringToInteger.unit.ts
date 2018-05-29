// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {test} from './utils';
import {ParameterLocation} from '@loopback/openapi-v3-types';

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

describe('coerce param from string to integer', () => {
  test(INT32_PARAM, '100', 100);
  test(INT64_PARAM, '9223372036854775807', 9223372036854775807);
});
