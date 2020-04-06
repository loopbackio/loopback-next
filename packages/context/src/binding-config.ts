// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingAddress, BindingKey} from './binding-key';
import {Context} from './context';
import {ResolutionOptions} from './resolution-session';
import {ValueOrPromise} from './value-promise';

/**
 * Resolver for configuration of bindings. It's responsible for finding
 * corresponding configuration for a given binding key.
 *
 * By default, `undefined` is expected if no configuration is provided. The
 * behavior can be overridden by setting `optional` to `false` in resolution
 * options.
 */
export interface ConfigurationResolver {
  /**
   * Resolve config for the binding key
   *
   * @param key - Binding key
   * @param propertyPath - Property path for the option. For example, `x.y`
   * requests for `<config>.x.y`. If not set, the `config` object will be
   * returned.
   * @param resolutionOptions - Options for the resolution.
   * - optional: if not set or set to `true`, `undefined` will be returned if
   * no corresponding value is found. Otherwise, an error will be thrown.
   */
  getConfigAsValueOrPromise<ConfigValueType>(
    key: BindingAddress<unknown>,
    propertyPath?: string,
    resolutionOptions?: ResolutionOptions,
  ): ValueOrPromise<ConfigValueType | undefined>;
}

/**
 * Resolver for configurations of bindings
 */
export class DefaultConfigurationResolver implements ConfigurationResolver {
  constructor(public readonly context: Context) {}

  getConfigAsValueOrPromise<ConfigValueType>(
    key: BindingAddress<unknown>,
    propertyPath?: string,
    resolutionOptions?: ResolutionOptions,
  ): ValueOrPromise<ConfigValueType | undefined> {
    propertyPath = propertyPath ?? '';
    const configKey = configBindingKeyFor(key, propertyPath);

    const options: ResolutionOptions = Object.assign(
      {optional: true},
      resolutionOptions,
    );
    return this.context.getValueOrPromise<ConfigValueType>(configKey, options);
  }
}

/**
 * Create binding key for configuration of the binding
 * @param key - Binding key for the target binding
 * @param propertyPath - Property path for the configuration
 */
export function configBindingKeyFor<ConfigValueType = unknown>(
  key: BindingAddress,
  propertyPath?: string,
) {
  return BindingKey.create<ConfigValueType>(
    BindingKey.buildKeyForConfig<ConfigValueType>(key).toString(),
    propertyPath,
  );
}
