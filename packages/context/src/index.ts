// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export * from '@loopback/metadata';

export {
  isPromiseLike,
  BoundValue,
  Constructor,
  ValueOrPromise,
  MapObject,
  resolveList,
  resolveMap,
  resolveUntil,
  transformValueOrPromise,
  tryWithFinally,
  getDeepProperty,
} from './value-promise';

export {Binding, BindingScope, BindingType, TagMap} from './binding';

export {Context} from './context';
export {BindingKey, BindingAddress} from './binding-key';
export {ResolutionSession} from './resolution-session';
export {inject, Setter, Getter, Injection, InjectionMetadata} from './inject';
export {Provider} from './provider';

export {instantiateClass, invokeMethod} from './resolver';
// internals for testing
export {describeInjectedArguments, describeInjectedProperties} from './inject';
