// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import * as Ajv from 'ajv';
import {JsonSchema} from '../..';

export function expectValidJsonSchema(schema: JsonSchema) {
  const ajv = new Ajv();
  const validate = ajv.compile(
    require('ajv/lib/refs/json-schema-draft-06.json'),
  );
  const isValid = validate(schema);
  const result = isValid
    ? 'JSON Schema is valid'
    : ajv.errorsText(validate.errors!);
  expect(result).to.equal('JSON Schema is valid');
}
