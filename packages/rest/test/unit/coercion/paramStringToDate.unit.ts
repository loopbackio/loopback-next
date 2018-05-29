// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {test} from './utils';
import {ParameterLocation} from '@loopback/openapi-v3-types';

const DATE_PARAM = {
  in: <ParameterLocation>'path',
  name: 'aparameter',
  schema: {type: 'string', format: 'date'},
};

describe('coerce param from string to date', () => {
  test(DATE_PARAM, '2015-03-01', new Date('2015-03-01'));
});
