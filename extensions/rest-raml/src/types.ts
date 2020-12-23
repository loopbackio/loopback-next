// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest-raml
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Interface defining the component's options object
 */
export interface RestRamlComponentOptions {
  // Add the definitions here
  httpPath?: string;
}

/**
 * Default options for the component
 */
export const DEFAULT_REST_RAML_COMPONENT_OPTIONS: RestRamlComponentOptions = {};
