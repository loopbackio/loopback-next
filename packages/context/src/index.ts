// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export {Binding, BindingScope, BindingType} from './binding';

export {Context} from './context';
export {Constructor} from './resolver';
export {ResolutionSession} from './resolution-session';
export {inject, Setter, Getter} from './inject';
export {Provider} from './provider';
export {
  isPromise,
  BoundValue,
  ValueOrPromise,
  MapObject,
  resolveList,
  resolveMap,
  tryWithFinally,
  getDeepProperty,
} from './value-promise';

// internals for testing
export {instantiateClass, invokeMethod} from './resolver';
export {
  describeInjectedArguments,
  describeInjectedProperties,
  Injection,
} from './inject';

export * from '@loopback/metadata';
