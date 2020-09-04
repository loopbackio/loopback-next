// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// Force require('reflect-metadata');
import '@loopback/core';
import {
  Arg,
  Args,
  ArgsType,
  Authorized,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from 'type-graphql';

/**
 * Re-exporting type-graphql decorators as lower case versions for two purposes:
 * - To be consistent with LoopBack's naming convention of decorators
 * - Allow future possibility to add extra metadata in addition to type-graphql's
 * behavior, for example, mapping to LoopBack model properties
 */
export const arg = Arg;
export const args = Args;
export const argsType = ArgsType;
export const fieldResolver = FieldResolver;
export const mutation = Mutation;
export const query = Query;
export const resolver = Resolver;
export const root = Root;
export const field = Field;
export const inputType = InputType;
export const objectType = ObjectType;
export const authorized = Authorized;
