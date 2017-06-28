// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Built-in types for LoopBack modeling
 * - Type: abstract base type
 * - StringType: string
 * - BooleanType: boolean
 * - NumberType: number
 * - DateType: Date
 * - BufferType: Buffer
 * - AnyType: any
 * - ArrayType: Array<T>
 * - UnionType: Union of types
 */
import {Type} from './type';
import {StringType} from './string';
import {BooleanType} from './boolean';
import {NumberType} from './number';
import {DateType} from './date';
import {BufferType} from './buffer';
import {AnyType} from './any';
import {ArrayType} from './array';
import {UnionType} from './union';
import {ObjectType} from './object';
import {ModelType} from './model';

export {
  Type,
  StringType,
  BooleanType,
  NumberType,
  DateType,
  BufferType,
  AnyType,
  ArrayType,
  UnionType,
  ModelType,
  ObjectType,
};

export const STRING = new StringType();
export const BOOLEAN = new BooleanType();
export const NUMBER = new NumberType();
export const DATE = new DateType();
export const BUFFER = new BufferType();
export const ANY = new AnyType();
