// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {generateUniqueId} from './unique-id';

export type BindingAddress<T = unknown> = string | BindingKey<T>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class BindingKey<ValueType> {
  static readonly PROPERTY_SEPARATOR = '#';

  /**
   * Create a new key for a binding bound to a value of type `ValueType`.
   *
   * @example
   *
   * ```ts
   * BindingKey.create<string>('application.name');
   * BindingKey.create<number>('config', 'rest.port);
   * BindingKey.create<number>('config#rest.port');
   * ```
   *
   * @param key - The binding key. When propertyPath is not provided, the key
   *   is allowed to contain propertyPath as encoded via `BindingKey#toString()`
   * @param propertyPath - Optional path to a deep property of the bound value.
   */
  public static create<V>(key: string, propertyPath?: string): BindingKey<V> {
    // TODO(bajtos) allow chaining of propertyPaths, e.g.
    //   BindingKey.create('config#rest', 'port')
    // should create {key: 'config', path: 'rest.port'}
    if (propertyPath) {
      BindingKey.validate(key);
      return new BindingKey<V>(key, propertyPath);
    }

    return BindingKey.parseKeyWithPath(key);
  }

  private constructor(
    public readonly key: string,
    public readonly propertyPath?: string,
  ) {}

  toString() {
    return this.propertyPath
      ? `${this.key}${BindingKey.PROPERTY_SEPARATOR}${this.propertyPath}`
      : this.key;
  }

  /**
   * Get a binding address for retrieving a deep property of the object
   * bound to the current binding key.
   *
   * @param propertyPath - A dot-separated path to a (deep) property, e.g. "server.port".
   */
  deepProperty<PropertyValueType>(propertyPath: string) {
    // TODO(bajtos) allow chaining of propertyPaths, e.g.
    //   BindingKey.create('config', 'rest').deepProperty('port')
    // should create {key: 'config', path: 'rest.port'}
    return BindingKey.create<PropertyValueType>(this.key, propertyPath);
  }

  /**
   * Validate the binding key format. Please note that `#` is reserved.
   * Returns a string representation of the binding key.
   *
   * @param key - Binding key, such as `a`, `a.b`, `a:b`, or `a/b`
   */
  static validate<T>(key: BindingAddress<T>): string {
    if (!key) throw new Error('Binding key must be provided.');
    key = key.toString();
    if (key.includes(BindingKey.PROPERTY_SEPARATOR)) {
      throw new Error(
        `Binding key ${key} cannot contain` +
          ` '${BindingKey.PROPERTY_SEPARATOR}'.`,
      );
    }
    return key;
  }

  /**
   * Parse a string containing both the binding key and the path to the deeply
   * nested property to retrieve.
   *
   * @param keyWithPath - The key with an optional path,
   *  e.g. "application.instance" or "config#rest.port".
   */
  static parseKeyWithPath<T>(keyWithPath: BindingAddress<T>): BindingKey<T> {
    if (typeof keyWithPath !== 'string') {
      return BindingKey.create<T>(keyWithPath.key, keyWithPath.propertyPath);
    }

    const index = keyWithPath.indexOf(BindingKey.PROPERTY_SEPARATOR);
    if (index === -1) {
      return new BindingKey<T>(keyWithPath);
    }

    return BindingKey.create<T>(
      keyWithPath.slice(0, index).trim(),
      keyWithPath.slice(index + 1),
    );
  }

  /**
   * Name space for configuration binding keys
   */
  static CONFIG_NAMESPACE = '$config';

  /**
   * Build a binding key for the configuration of the given binding.
   * The format is `<key>:$config`
   *
   * @param key - Key of the target binding to be configured
   */
  static buildKeyForConfig<T>(key: BindingAddress = ''): BindingAddress<T> {
    const suffix = BindingKey.CONFIG_NAMESPACE;
    const bindingKey = key ? `${key}:${suffix}` : suffix;
    return bindingKey;
  }

  /**
   * Generate a universally unique binding key.
   *
   * Please note the format of they generated key is not specified, you must
   * not rely on any specific formatting (e.g. UUID style).
   *
   * @param namespace - Namespace for the binding
   */
  static generate<T>(namespace = ''): BindingKey<T> {
    const prefix = namespace ? `${namespace}.` : '';
    const name = generateUniqueId();
    return BindingKey.create(`${prefix}${name}`);
  }
}
