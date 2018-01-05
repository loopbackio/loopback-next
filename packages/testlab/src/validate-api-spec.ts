// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {OpenApiSpec} from '@loopback/openapi-spec-types';
const validator = require('swagger2openapi/validate.js');
import * as util from 'util';
const promisify = util.promisify;
const promisifiedValidator = promisify(validator.validate);

export async function validateApiSpec(spec: OpenApiSpec): Promise<void> {
  const opts = {};
  if (!spec.openapi) {
    throw new Error('Missing required property: swagger at #/');
  }

  if (!spec.info) {
    throw new Error('Missing required property: info at #/');
  }

  if (!spec.paths) {
    throw new Error('Missing required property: paths at #/');
  }

  try {
    await promisifiedValidator(spec, opts);
  } catch (err) {
    throw new Error(err);
  }
}
