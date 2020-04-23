// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {ConnectionOptions, Document, Model, Schema} from 'mongoose';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MongooseSchema<T extends Document> {
  /**
   * In the mongoose world, you interace directly with the models
   * created from mongoose.model()
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
  name: string;
  bindingKey?: string | BindingKey<Model<T>>;
  schema: Schema<T>;
  collection?: string;
}

export interface MongooseDiscriminator<T extends Document, M extends Document> {
  name: string;
  modelKey: string | BindingKey<Model<M>>;
  bindingKey?: string | BindingKey<Model<T>>;
  schema: Schema<T>;
  value?: string;
}

export interface MongooseConnectionOptions {
  uri: string;
  connectionOptions?: ConnectionOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schemas?: MongooseSchema<any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  discriminators?: MongooseDiscriminator<any, any>[];
}

export type MongooseConfig =
  | MongooseConnectionOptions
  | MongooseConnectionOptions[];
