// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const validator = require('swagger2openapi/validate.js');
import {promisify} from 'util';

const validateAsync = promisify(validator.validate);

// tslint:disable-next-line:no-any
export async function validateApiSpec(spec: any): Promise<void> {
  const opts = {};

  try {
    await validateAsync(spec, opts);
  } catch (err) {
    throw new Error(err);
  }
}
