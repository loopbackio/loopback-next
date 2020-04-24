// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typegoose
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {mongoose, ReturnModelType} from '@typegoose/typegoose';
import {
  AnyParamConstructor,
  ICustomOptions,
} from '@typegoose/typegoose/lib/types';
import {ConnectionOptions, SchemaOptions} from 'mongoose';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TypegooseSchema<U extends AnyParamConstructor<T>, T = any> {
  /**
   * In the mongoose/typegoose world, you interace directly with the models
   * created from mongoose.model() or typegoose.getModelForClass()
   *
   * These are bound to specific connections, which can be either a global
   * connection or a specific connection.
   *
   * In either case, you need to create your own binding key for each
   * connection that you have configured.
   *
   * Pass the Schema Class Constructor type in configuration, and when you
   * @inject(YourModelBindingKey), you'll have the correct ReturnModelType
   */
  bindingKey?: string | BindingKey<ReturnModelType<U>>;
  schema: U;
  schemaOptions?: SchemaOptions;
  options?: ICustomOptions;
}

export interface TypegooseDiscriminator<
  U extends AnyParamConstructor<T>,
  Mu extends AnyParamConstructor<Mt>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Mt = any
> {
  modelKey: BindingKey<ReturnModelType<Mu>>;
  bindingKey?: string | BindingKey<ReturnModelType<U>>;
  schema: U;
}

export interface BaseTypegooseConnectionOptions {
  uri: string;
  connectionOptions?: ConnectionOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schemas?: TypegooseSchema<any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  discriminators?: TypegooseDiscriminator<any, any>[];
}

export interface UriTypegooseConnectionOptions
  extends BaseTypegooseConnectionOptions {
  uri: string;
}

export interface ExistingTypegooseConnectionOptions
  extends BaseTypegooseConnectionOptions {
  connection: mongoose.Connection;
}

export type TypegooseConfig =
  | ExistingTypegooseConnectionOptions
  | UriTypegooseConnectionOptions
  | Array<UriTypegooseConnectionOptions | ExistingTypegooseConnectionOptions>;
