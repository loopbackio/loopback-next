// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export type BindingAddress<T = unknown> = string | BindingKey<T>;

// tslint:disable-next-line:no-unused
export class BindingKey<ValueType> {
  static readonly PROPERTY_SEPARATOR = '#';

  /**
   * Create a new key for a binding bound to a value of type `ValueType`.
   *
   * **Example**
   *
   * ```ts
   * BindingKey.create<string>('application.name');
   * BindingKey.create<number>('config', 'rest.port);
   * BindingKey.create<number>('config#rest.port');
   * ```
   *
   * @param key The binding key. When propertyPath is not provided, the key
   *   is allowed to contain propertyPath as encoded via `BindingKey#toString()`
   * @param propertyPath Optional path to a deep property of the bound value.
   */
  public static create<ValueType>(
    key: string,
    propertyPath?: string,
  ): BindingKey<ValueType> {
    // TODO(bajtos) allow chaining of propertyPaths, e.g.
    //   BindingKey.create('config#rest', 'port')
    // should create {key: 'config', path: 'rest.port'}
    if (propertyPath) {
      BindingKey.validate(key);
      return new BindingKey<ValueType>(key, propertyPath);
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
   * @param propertyPath A dot-separated path to a (deep) property, e.g. "server.port".
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
   * @param key Binding key, such as `a`, `a.b`, `a:b`, or `a/b`
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
   * @param keyWithPath The key with an optional path,
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
      keyWithPath.substr(0, index).trim(),
      keyWithPath.substr(index + 1),
    );
  }
}
