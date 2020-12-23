// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest-raml
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, CoreBindings} from '@loopback/core';
import {RestRamlComponent} from './component';

/**
 * Binding keys used by this component.
 */
export namespace RestRamlBindings {
  const NAMESPACE = 'raml';
  export const COMPONENT = BindingKey.create<RestRamlComponent>(
    `${CoreBindings.COMPONENTS}.LoopbackRestRamlComponent`,
  );
  export const RAML_SPEC = BindingKey.create<string>(`${NAMESPACE}.ramlSpec`);
}
