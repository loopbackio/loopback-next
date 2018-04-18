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
} from '@loopback/context';
import {HttpErrors} from '@loopback/rest';

export const VALIDATION_KEY = MetadataAccessor.create<JSONSchema6>(
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
    descriptor.value = function(...args: any[]) {
      const ajv = new AJV();
      const schemas = MetadataInspector.getAllParameterMetadata(
        VALIDATION_KEY,
        target,
        member,
      )!;
      for (let i = 0; i < args.length; i++) {
        const schema = schemas[i];
        if (schema) {
          const isValid = ajv.validate(schema, args[i]);
          if (!isValid) {
            throw new HttpErrors.UnprocessableEntity('bad param');
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

export function validate(schema: JSONSchema6) {
  return ParameterDecoratorFactory.createDecorator(VALIDATION_KEY, schema);
}
