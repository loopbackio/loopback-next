// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/validator
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {JSONSchema6} from 'json-schema';
import * as AJV from 'ajv';
import {
  MetadataAccessor,
  MetadataInspector,
  ParameterDecoratorFactory,
} from '@loopback/metadata';
import * as HttpErrors from 'http-errors';

const debug = require('debug')('loopback:validator');

// tslint:disable-next-line:no-any
export type Validator = (arg: any) => boolean | Promise<boolean>;

export const VALIDATION_KEY = MetadataAccessor.create<JSONSchema6 | Validator>(
  'validation.parameter',
);

export function validatable() {
  return function(
    target: Object,
    member: string,
    // tslint:disable-next-line:no-any
    descriptor: TypedPropertyDescriptor<(...args: any[]) => any>,
  ) {
    const originalMethod = descriptor.value;
    if (!originalMethod) {
      throw new Error(
        'No method found for some reason, this should not happen',
      );
    }
    // tslint:disable-next-line:no-any
    descriptor.value = async function(...args: any[]) {
      const ajv = new AJV();
      const schemas = MetadataInspector.getAllParameterMetadata(
        VALIDATION_KEY,
        target,
        member,
      )!;
      for (let i = 0; i < args.length; i++) {
        const schema = schemas[i];
        if (typeof schema === 'object') {
          // is a JSON Schema
          debug('validating %s against %o', args[i], schema);
          const isValid = ajv.validate(schema, args[i]);
          if (!isValid) {
            throw new HttpErrors.UnprocessableEntity(
              ajv.errorsText(ajv.errors, {dataVar: args[i]}),
            );
          }
        } else if (typeof schema === 'function') {
          // is a validator function
          debug('validating %s against %o', args[i], schema);
          const isValid = await schema(args[i]);
          if (!isValid) {
            throw new HttpErrors.UnprocessableEntity(
              `${args[i]} is not a valid argument`,
            );
          }
        }
      }
      // tslint:disable-next-line:no-invalid-this
      return originalMethod.apply(this, args);
    };
    // hacky way of bypassing rest parameter length issue;
    // see DecoratorFactory.getNumberOfParameters in @loopback/context
    Object.defineProperty(descriptor.value, 'length', {
      value: originalMethod.length,
    });
    return descriptor;
  };
}

export function validate(schemaOrValidator: JSONSchema6 | Validator) {
  return ParameterDecoratorFactory.createDecorator(
    VALIDATION_KEY,
    schemaOrValidator,
  );
}
