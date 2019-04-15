// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-greeter-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingTemplate} from '@loopback/context';
import {extensionFor} from '@loopback/core';

/**
 * Typically an extension point defines an interface as the contract for
 * extensions to implement
 */
export interface Greeter {
  language: string;
  greet(name: string): string;
}

/**
 * Name/id of the greeter extension point
 */
export const GREETER_EXTENSION_POINT_NAME = 'greeters';

/**
 * A binding template for greeter extensions
 */
export const asGreeter: BindingTemplate = binding => {
  extensionFor(GREETER_EXTENSION_POINT_NAME)(binding);
  binding.tag({namespace: 'greeters'});
};
