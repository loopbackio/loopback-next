// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export {Binding, BoundValue} from './binding';
export {Context} from './context';
export {Constructor} from './resolver';
export {inject} from './inject';
export const isPromise = require('is-promise');

// internals for testing
export {instantiateClass} from './resolver';
export {describeInjectedArguments, describeInjectedProperties} from './inject';
export {Reflector} from './reflect';

