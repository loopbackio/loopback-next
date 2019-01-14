// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DataSource, Options, AnyObject} from 'loopback-datasource-juggler';

export {Callback, Filter, Where} from 'loopback-datasource-juggler';
export {DataSource, Options};

export type DataSourceConfig = Options;

export type ModelProperties = AnyObject;
export type ModelSettings = AnyObject;

export interface ModelDefinition extends AnyObject {
  name: string;
  // TODO: describe common options and property definition format
}

export interface ModelConfig extends AnyObject {
  dataSource: string | DataSource | null;
  // TODO: describe other settings, e.g. "public", "methods", etc.
}

// A type-safe way how to express plain-data objects:
// - safer than PersistedData<T> from juggler, PDO does not allow functions
// - does not require explicit type casts, e.g. when calling MyModel.create()
export interface PlainDataObject {
  [prop: string]: ComplexValue;
}

export type ComplexValue =
  | PrimitiveValue // a value
  | PrimitiveValue[] // an array of values
  | {[prop: string]: ComplexValue} // an object with values
  | [{[prop: string]: ComplexValue}]; // an array of objects

export type PrimitiveValue = undefined | null | number | string;
