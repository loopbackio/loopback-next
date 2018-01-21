// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as debugModule from 'debug';
import {BindingAddress, BindingKey} from './binding-key';
import {Context} from './context';
import {ResolutionOptions} from './resolution-session';
import {
  BoundValue,
  ValueOrPromise,
  resolveUntil,
  transformValueOrPromise,
} from './value-promise';

const debug = debugModule('loopback:context:config');

/**
 * Interface for configuration resolver
 */
export interface ConfigurationResolver {
  /**
   * Resolve the configuration value for a given binding key and config property
   * path
   * @param key Binding key
   * @param configPath Config property path
   * @param resolutionOptions Resolution options
   */
  getConfigAsValueOrPromise<ConfigValueType>(
    key: BindingAddress<BoundValue>,
    configPath?: string,
    resolutionOptions?: ResolutionOptions,
  ): ValueOrPromise<ConfigValueType | undefined>;
}

/**
 * Resolver for configurations of bindings
 */
export class DefaultConfigurationResolver implements ConfigurationResolver {
  constructor(public readonly context: Context) {}

  /**
   * Resolve config from the binding key hierarchy using namespaces
   * separated by `.`
   *
   * For example, if the binding key is `servers.rest.server1`, we'll try the
   * following entries:
   * 1. servers.rest.server1:$config#host (namespace: server1)
   * 2. servers.rest:$config#server1.host (namespace: rest)
   * 3. servers.$config#rest.server1.host` (namespace: server)
   * 4. $config#servers.rest.server1.host (namespace: '' - root)
   *
   * @param key Binding key with namespaces separated by `.`
   * @param configPath Property path for the option. For example, `x.y`
   * requests for `config.x.y`. If not set, the `config` object will be
   * returned.
   * @param resolutionOptions Options for the resolution.
   * - localConfigOnly: if set to `true`, no parent namespaces will be checked
   * - optional: if not set or set to `true`, `undefined` will be returned if
   * no corresponding value is found. Otherwise, an error will be thrown.
   */
  getConfigAsValueOrPromise<ConfigValueType>(
    key: BindingAddress<BoundValue>,
    configPath?: string,
    resolutionOptions?: ResolutionOptions,
  ): ValueOrPromise<ConfigValueType | undefined> {
    const env = resolutionOptions && resolutionOptions.environment;
    configPath = configPath || '';
    const configKey = BindingKey.create<ConfigValueType>(
      BindingKey.buildKeyForConfig(key, env),
      configPath,
    );

    const localConfigOnly =
      resolutionOptions && resolutionOptions.localConfigOnly;

    /**
     * Set up possible keys to resolve the config value
     */
    key = key.toString();
    const keys = [];
    while (true) {
      const configKeyAndPath = BindingKey.create<ConfigValueType>(
        BindingKey.buildKeyForConfig(key, env),
        configPath,
      );
      keys.push(configKeyAndPath);
      if (env) {
        // The `environment` is set, let's try the non env specific binding too
        keys.push(
          BindingKey.create<ConfigValueType>(
            BindingKey.buildKeyForConfig(key),
            configPath,
          ),
        );
      }
      if (!key || localConfigOnly) {
        // No more keys
        break;
      }
      // Shift last part of the key into the path as we'll try the parent
      // namespace in the next iteration
      const index = key.lastIndexOf('.');
      configPath = configPath
        ? `${key.substring(index + 1)}.${configPath}`
        : `${key.substring(index + 1)}`;
      key = key.substring(0, index);
    }
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Configuration keyWithPaths: %j', keys);
    }

    const resolveConfig = (keyWithPath: string) => {
      // Set `optional` to `true` to resolve config locally
      const options = Object.assign(
        {}, // Make sure resolutionOptions is copied
        resolutionOptions,
        {optional: true}, // Force optional to be true
      );
      return this.context.getValueOrPromise<ConfigValueType>(
        keyWithPath,
        options,
      );
    };

    const evaluateConfig = (keyWithPath: string, val: ConfigValueType) => {
      /* istanbul ignore if */
      if (debug.enabled) {
        debug('Configuration keyWithPath: %s => value: %j', keyWithPath, val);
      }
      // Found the corresponding config
      if (val !== undefined) return true;

      if (localConfigOnly) {
        return true;
      }
      return false;
    };

    const required = resolutionOptions && resolutionOptions.optional === false;
    const valueOrPromise = resolveUntil<
      BindingAddress<ConfigValueType>,
      ConfigValueType
    >(keys[Symbol.iterator](), resolveConfig, evaluateConfig);
    return transformValueOrPromise<
      ConfigValueType | undefined,
      ConfigValueType | undefined
    >(valueOrPromise, val => {
      if (val === undefined && required) {
        throw Error(`Configuration '${configKey}' cannot be resolved`);
      }
      return val;
    });
  }
}
