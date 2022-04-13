// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AjvFormat} from '../types';

/**
 * int32: [-2147483648, 21474836 47]
 */
export const int32Format: AjvFormat<number> = {
  name: 'int32',
  type: 'number',
  validate: (value: number) => {
    return (
      Number.isInteger(value) && value >= -2147483648 && value <= 2147483647
    );
  },
  async: false,
};

/**
 * int64: [-9223372036854775808, 9223372036854775807]
 */
export const int64Format: AjvFormat<number> = {
  name: 'int64',
  type: 'number',
  validate: (value: number) => {
    const max = Number.MAX_SAFE_INTEGER; // 9007199254740991
    const min = Number.MIN_SAFE_INTEGER; // -9007199254740991
    return Number.isInteger(value) && value >= min && value <= max;
  },
  async: false,
};

/**
 * float: [-2^128, 2^128]
 */
export const floatFormat: AjvFormat<number> = {
  name: 'float',
  type: 'number',
  validate: (value: number) => {
    return value >= -Math.pow(2, 128) && value <= Math.pow(2, 128);
  },
  async: false,
};

/**
 * double: [-2^1024, 2^1024]
 */
export const doubleFormat: AjvFormat<number> = {
  name: 'double',
  type: 'number',
  validate: (value: number) => {
    const max = Number.MAX_VALUE; // 1.7976931348623157e+308
    const min = -Number.MAX_VALUE; // -1.7976931348623157e+308
    return value >= min && value <= max;
  },
  async: false,
};

/**
 * Base64 encoded string
 */
export const byteFormat: AjvFormat = {
  name: 'byte',
  type: 'string',
  validate: (value: string) => {
    const base64 = Buffer.from(value, 'base64').toString('base64');
    return value === base64;
  },
  async: false,
};

/**
 * Binary string
 */
export const binaryFormat: AjvFormat = {
  name: 'binary',
  type: 'string',
  validate: (value: string) => true,
  async: false,
};

export const openapiFormats: (AjvFormat<string> | AjvFormat<number>)[] = [
  int32Format,
  int64Format,
  floatFormat,
  doubleFormat,
  byteFormat,
  binaryFormat,
];
