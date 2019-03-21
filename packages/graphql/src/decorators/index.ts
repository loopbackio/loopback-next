// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// Force require('reflect-metadata');
import '@loopback/metadata';
import {
  Arg,
  Args,
  ArgsType,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from 'type-graphql';

// export namespace graphql {
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
// }
