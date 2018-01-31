// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as assert from 'assert';
import {ParameterObject, isSchemaObject} from '@loopback/openapi-v3-types';
/**
 * Simple deserializers for HTTP parameters
 * @param val The value of the corresponding parameter type or a string
 * @param param The Swagger parameter object
 */
// tslint:disable-next-line:no-any
export function deserialize(val: any, param: ParameterObject): any {
  if (val == null) {
    if (param.required) {
      throw new Error(
        `Value is not provided for required parameter ${param.name}`,
      );
    }
    return val;
  }
  let type = 'string';
  let format = '';
  if (param.schema && isSchemaObject(param.schema)) {
    type = param.schema.type || 'string';
    format = param.schema.format || '';
  }

  const style = param.style;

  if (style === 'matrix' || style === 'label') {
    throw new Error(`Parameter ${param.name} style ${style} is not supported`);
  }

  switch (type) {
    case 'string':
      if (typeof val === 'string') {
        if (format === 'date' || format === 'date-time') {
          return new Date(val);
        } else if (format === 'byte') {
          return Buffer.from(val, 'base64').toString('utf8');
        }
        return val;
      }
      throw new Error(
        `Invalid value ${val} for parameter ${param.name}: ${type}`,
      );
    case 'number':
    case 'integer':
      let num: number = NaN;
      if (typeof val === 'string') {
        num = Number(val);
      } else if (typeof val === 'number') {
        num = val;
      }
      if (isNaN(num)) {
        throw new Error(
          `Invalid value ${val} for parameter ${param.name}: ${type}`,
        );
      }
      if (type === 'integer' && !Number.isInteger(num)) {
        throw new Error(
          `Invalid value ${val} for parameter ${param.name}: ${type}`,
        );
      }
      return num;
    case 'boolean':
      if (typeof val === 'boolean') return val;
      if (val === 'false') return false;
      else if (val === 'true') return true;
      throw new Error(
        `Invalid value ${val} for parameter ${param.name}: ${type}`,
      );
    case 'array':
      let items = val;
      if (typeof val === 'string') {
        switch (style) {
          case 'spaceDelimited': // space separated values foo bar.
            items = val.split(' ');
            break;
          case 'pipeDelimited': // pipe separated values foo|bar.
            items = val.split('|');
            break;
          case 'simple': // comma separated values foo,bar.
          case 'form': // comma separated values foo,bar.
            items = val.split(',');
            break;
          case 'deepObject':
          default:
            items = val.split(',');
        }
      }
      if (Array.isArray(items)) {
        return items.map(i => deserialize(i, getItemDescriptor(param)));
      }
      throw new Error(
        `Invalid value ${val} for parameter ${param.name}: ${type}`,
      );
  }
  return val;
}

/**
 * Get the array item descriptor
 * @param param
 */
function getItemDescriptor(param: ParameterObject): ParameterObject {
  assert(param.type === 'array' && param.items, 'Parameter type is not array');
  return Object.assign(
    {in: param.in, name: param.name, description: param.description},
    param.items,
  );
}
