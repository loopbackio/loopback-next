// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {test} from './utils';
import {RestHttpErrors} from '../../../';
import {ParameterLocation} from '@loopback/openapi-v3-types';

const INVALID_PARAM = {
  in: <ParameterLocation>'unknown',
  name: 'aparameter',
  schema: {type: 'unknown'},
};

describe('throws error for invalid parameter spec', () => {
  test(INVALID_PARAM, '', RestHttpErrors.invalidParamLocation('unknown'));
});
