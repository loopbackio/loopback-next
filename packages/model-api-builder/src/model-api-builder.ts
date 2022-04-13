// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/model-api-builder
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingTemplate, extensionFor} from '@loopback/core';
import {ApplicationWithRepositories, Model} from '@loopback/repository';
import {ModelApiConfig} from './model-api-config';

/**
 * Extension Point name for Model API builders.
 */
export const MODEL_API_BUILDER_PLUGINS = 'model-api-builders';

/**
 * Interface for extensions contributing custom API flavors.
 */
export interface ModelApiBuilder {
  readonly pattern: string; // e.g. CrudRest
  build(
    application: ApplicationWithRepositories,
    modelClass: typeof Model & {prototype: Model},
    config: ModelApiConfig,
  ): Promise<void>;
}

/**
 * A binding template for model API extensions
 */
export const asModelApiBuilder: BindingTemplate = binding => {
  extensionFor(MODEL_API_BUILDER_PLUGINS)(binding);
  binding.tag({namespace: 'model-api-builders'});
};
