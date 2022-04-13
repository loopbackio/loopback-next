// Copyright IBM Corp. and LoopBack contributors 2017,2020. All Rights Reserved.
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
import {AnyType} from './any';
import {ArrayType} from './array';
import {BooleanType} from './boolean';
import {BufferType} from './buffer';
import {DateType} from './date';
import {ModelType} from './model';
import {NullType} from './null';
import {NumberType} from './number';
import {ObjectType} from './object';
import {StringType} from './string';
import {Type} from './type';
import {UnionType} from './union';

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
  NullType,
  ObjectType,
};

export const STRING = new StringType();
export const BOOLEAN = new BooleanType();
export const NUMBER = new NumberType();
export const DATE = new DateType();
export const BUFFER = new BufferType();
export const ANY = new AnyType();
export const NULL = new NullType();
