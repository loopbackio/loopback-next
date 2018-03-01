// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {OpenApiSpec} from '@loopback/openapi-v3-types';
const validator = require('swagger2openapi/validate.js');
import {promisify} from 'util';

const validateAsync = promisify(validator.validate);

export async function validateApiSpec(spec: OpenApiSpec): Promise<void> {
  const opts = {};

  try {
    await validateAsync(spec, opts);
  } catch (err) {
    throw new Error(err);
  }
}
