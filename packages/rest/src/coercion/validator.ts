// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ParameterObject, SchemaObject} from '@loopback/openapi-v3';
import {RestHttpErrors} from '../';

/**
 * A set of options to pass into the validator functions
 */
export type ValidationOptions = {
  required?: boolean;
};

/**
 * The context information that a validator needs
 */
export type ValidationContext = {
  parameterSpec: ParameterObject;
};

/**
 * Validator class provides a bunch of functions that perform
 * validations on the request parameters and request body.
 */
export class Validator {
  constructor(public ctx: ValidationContext) {}

  /**
   * The validation executed before type coercion. Like
   * checking absence.
   *
   * @param type - A parameter's type.
   * @param value - A parameter's raw value from http request.
   * @param opts - options
   */
  validateParamBeforeCoercion(
    value: string | object | undefined,
    opts?: ValidationOptions,
  ) {
    if (this.isAbsent(value) && this.isRequired(opts)) {
      const name = this.ctx.parameterSpec.name;
      throw RestHttpErrors.missingRequired(name);
    }
  }

  /**
   * Check is a parameter required or not.
   *
   * @param opts
   */
  isRequired(opts?: ValidationOptions) {
    if (this.ctx.parameterSpec.required) return true;
    if (opts?.required) return true;
    return false;
  }

  /**
   * Return `true` if the value is empty, return `false` otherwise.
   *
   * @param value
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isAbsent(value: any) {
    if (value === '' || value === undefined) return true;

    const spec: ParameterObject = this.ctx.parameterSpec;
    const schema: SchemaObject = this.ctx.parameterSpec.schema ?? {};
    const valueIsNull = value === 'null' || value === null;

    if (this.isUrlEncodedJsonParam()) {
      // is this an url encoded Json object query parameter?
      // check for NULL values
      if (valueIsNull) return true;
    } else if (spec.schema) {
      // if parameter spec contains schema object, check if supplied value is NULL
      if (schema.type === 'object' && valueIsNull) return true;
    }

    return false;
  }

  /**
   * Return `true` if defined specification is for a url encoded Json object query parameter
   *
   * for url encoded Json object query parameters,
   * schema is defined under content['application/json']
   */
  isUrlEncodedJsonParam() {
    const spec: ParameterObject = this.ctx.parameterSpec;

    if (spec.in === 'query' && spec.content?.['application/json']?.schema) {
      return true;
    }
    return false;
  }
}
