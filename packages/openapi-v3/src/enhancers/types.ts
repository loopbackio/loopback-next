// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingTemplate, extensionFor, ValueOrPromise} from '@loopback/core';
import {OpenApiSpec} from '../types';
import {OASEnhancerBindings} from './keys';

/**
 * Typically an extension point defines an interface as the contract for
 * extensions to implement
 */
export interface OASEnhancer {
  name: string;
  modifySpec(spec: OpenApiSpec): ValueOrPromise<OpenApiSpec>;
}

/**
 * A binding template for spec contributor extensions
 */
export const asSpecEnhancer: BindingTemplate = binding => {
  extensionFor(OASEnhancerBindings.OAS_ENHANCER_EXTENSION_POINT_NAME)(binding);
  // is it ok to have a different namespace than the extension point name?
  binding.tag({namespace: 'oas-enhancer'});
};
