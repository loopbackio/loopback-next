// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export {
  Binding,
  BindingScope,
  BindingType,
  BoundValue,
  ValueOrPromise,
} from './binding';

export {Context} from './context';
export {Constructor} from './resolver';
export {inject, Setter, Getter} from './inject';
export {NamespacedReflect} from './reflect';
export {Provider} from './provider';
export {isPromise} from './is-promise';

// internals for testing
export {instantiateClass, invokeMethod} from './resolver';
export {
  describeInjectedArguments,
  describeInjectedProperties,
  Injection,
} from './inject';
export {Reflector} from './reflect';
