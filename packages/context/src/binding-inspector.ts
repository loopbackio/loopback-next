// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MetadataAccessor, MetadataInspector} from '@loopback/metadata';
import * as debugFactory from 'debug';
import {Binding, BindingScope, BindingTag, BindingTemplate} from './binding';
import {BindingAddress} from './binding-key';
import {ContextTags} from './keys';
import {Provider} from './provider';
import {Constructor} from './value-promise';

const debug = debugFactory('loopback:context:binding-inspector');

/**
 * Binding metadata from `@bind`
 */
export type BindingMetadata = {
  /**
   * An array of template functions to configure a binding
   */
  templates: BindingTemplate[];
  /**
   * The target class where binding metadata is decorated
   */
  target: Constructor<unknown>;
};

/**
 * Metadata key for binding metadata
 */
export const BINDING_METADATA_KEY = MetadataAccessor.create<
  BindingMetadata,
  ClassDecorator
>('binding.metadata');

/**
 * An object to configure binding scope and tags
 */
export type BindingScopeAndTags = {
  scope?: BindingScope;
  tags?: BindingTag | BindingTag[];
};

/**
 * Specification of parameters for `@bind()`
 */
export type BindingSpec = BindingTemplate | BindingScopeAndTags;

/**
 * Check if a class implements `Provider` interface
 * @param cls - A class
 */
export function isProviderClass(
  cls: Constructor<unknown>,
): cls is Constructor<Provider<unknown>> {
  return cls && typeof cls.prototype.value === 'function';
}

/**
 * A factory function to create a template function to bind the target class
 * as a `Provider`.
 * @param target - Target provider class
 */
export function asProvider(
  target: Constructor<Provider<unknown>>,
): BindingTemplate {
  return function bindAsProvider(binding) {
    binding.toProvider(target).tag(ContextTags.PROVIDER, {
      [ContextTags.TYPE]: ContextTags.PROVIDER,
    });
  };
}

/**
 * A factory function to create a template function to bind the target class
 * as a class or `Provider`.
 * @param target - Target class, which can be an implementation of `Provider`
 */
export function asClassOrProvider(
  target: Constructor<unknown>,
): BindingTemplate {
  // Add a template to bind to a class or provider
  return function bindAsClassOrProvider(binding) {
    if (isProviderClass(target)) {
      asProvider(target)(binding);
    } else {
      binding.toClass(target);
    }
  };
}

/**
 * Convert binding scope and tags as a template function
 * @param scopeAndTags - Binding scope and tags
 */
export function asBindingTemplate(
  scopeAndTags: BindingScopeAndTags,
): BindingTemplate {
  return function applyBindingScopeAndTag(binding) {
    if (scopeAndTags.scope) {
      binding.inScope(scopeAndTags.scope);
    }
    if (scopeAndTags.tags) {
      if (Array.isArray(scopeAndTags.tags)) {
        binding.tag(...scopeAndTags.tags);
      } else {
        binding.tag(scopeAndTags.tags);
      }
    }
  };
}

/**
 * Get binding metadata for a class
 * @param target - The target class
 */
export function getBindingMetadata(
  target: Function,
): BindingMetadata | undefined {
  return MetadataInspector.getClassMetadata<BindingMetadata>(
    BINDING_METADATA_KEY,
    target,
  );
}

/**
 * A binding template function to delete `name` and `key` tags
 */
export function removeNameAndKeyTags(binding: Binding<unknown>) {
  if (binding.tagMap) {
    delete binding.tagMap.name;
    delete binding.tagMap.key;
  }
}

/**
 * Get the binding template for a class with binding metadata
 *
 * @param cls - A class with optional `@bind`
 */
export function bindingTemplateFor<T = unknown>(
  cls: Constructor<T | Provider<T>>,
): BindingTemplate<T> {
  const spec = getBindingMetadata(cls);
  debug('class %s has binding metadata', cls.name, spec);
  const templateFunctions = (spec && spec.templates) || [
    asClassOrProvider(cls),
  ];
  return function applyBindingTemplatesFromMetadata(binding) {
    for (const t of templateFunctions) {
      binding.apply(t);
    }
    if (spec && spec.target !== cls) {
      // Remove name/key tags inherited from base classes
      binding.apply(removeNameAndKeyTags);
    }
  };
}

/**
 * Mapping artifact types to binding key namespaces (prefixes).
 *
 * @example
 * ```ts
 * {
 *   repository: 'repositories'
 * }
 * ```
 */
export type TypeNamespaceMapping = {[name: string]: string};

export const DEFAULT_TYPE_NAMESPACES: TypeNamespaceMapping = {
  class: 'classes',
  provider: 'providers',
};

/**
 * Options to customize the binding created from a class
 */
export type BindingFromClassOptions = {
  /**
   * Binding key
   */
  key?: BindingAddress;
  /**
   * Artifact type, such as `server`, `controller`, `repository` or `service`
   */
  type?: string;
  /**
   * Artifact name, such as `my-rest-server` and `my-controller`
   */
  name?: string;
  /**
   * Namespace for the binding key, such as `servers` and `controllers`
   */
  namespace?: string;
  /**
   * Mapping artifact type to binding key namespaces
   */
  typeNamespaceMapping?: TypeNamespaceMapping;
  /**
   * Default scope if the binding does not have an explicit scope
   */
  defaultScope?: BindingScope;
};

/**
 * Create a binding from a class with decorated metadata. The class is attached
 * to the binding as follows:
 * - `binding.toClass(cls)`: if `cls` is a plain class such as `MyController`
 * - `binding.toProvider(cls)`: it `cls` is a value provider class with a
 * prototype method `value()`
 *
 * @param cls - A class. It can be either a plain class or  a value provider class
 * @param options - Options to customize the binding key
 */
export function createBindingFromClass<T = unknown>(
  cls: Constructor<T | Provider<T>>,
  options: BindingFromClassOptions = {},
): Binding<T> {
  debug('create binding from class %s with options', cls.name, options);
  try {
    const templateFn = bindingTemplateFor(cls);
    const key = buildBindingKey(cls, options);
    const binding = Binding.bind<T>(key).apply(templateFn);
    applyClassBindingOptions(binding, options);
    return binding;
  } catch (err) {
    err.message += ` (while building binding for class ${cls.name})`;
    throw err;
  }
}

function applyClassBindingOptions<T>(
  binding: Binding<T>,
  options: BindingFromClassOptions,
) {
  if (options.name) {
    binding.tag({name: options.name});
  }
  if (options.type) {
    binding.tag({type: options.type}, options.type);
  }
  if (options.defaultScope) {
    binding.applyDefaultScope(options.defaultScope);
  }
}

/**
 * Find/infer binding key namespace for a type
 * @param type - Artifact type, such as `controller`, `datasource`, or `server`
 * @param typeNamespaces - An object mapping type names to namespaces
 */
function getNamespace(type: string, typeNamespaces = DEFAULT_TYPE_NAMESPACES) {
  if (type in typeNamespaces) {
    return typeNamespaces[type];
  } else {
    // Return the plural form
    return `${type}s`;
  }
}

/**
 * Build the binding key for a class with optional binding metadata.
 * The binding key is resolved in the following steps:
 *
 * 1. Check `options.key`, if it exists, return it
 * 2. Check if the binding metadata has `key` tag, if yes, return its tag value
 * 3. Identify `namespace` and `name` to form the binding key as
 * `<namespace>.<name>`.
 *   - namespace
 *     - `options.namespace`
 *     - `namespace` tag value
 *     - Map `options.type` or `type` tag value to a namespace, for example,
 *       'controller` to 'controller'.
 *   - name
 *     - `options.name`
 *     - `name` tag value
 *     - the class name
 *
 * @param cls - A class to be bound
 * @param options - Options to customize how to build the key
 */
function buildBindingKey(
  cls: Constructor<unknown>,
  options: BindingFromClassOptions = {},
) {
  if (options.key) return options.key;

  const templateFn = bindingTemplateFor(cls);
  // Create a temporary binding
  const bindingTemplate = new Binding('template').apply(templateFn);
  // Is there a `key` tag?
  let key: string = bindingTemplate.tagMap[ContextTags.KEY];
  if (key) return key;

  let namespace =
    options.namespace || bindingTemplate.tagMap[ContextTags.NAMESPACE];
  if (!namespace) {
    const namespaces = Object.assign(
      {},
      DEFAULT_TYPE_NAMESPACES,
      options.typeNamespaceMapping,
    );
    // Derive the key from type + name
    let type = options.type || bindingTemplate.tagMap[ContextTags.TYPE];
    if (!type) {
      type =
        bindingTemplate.tagNames.find(t => namespaces[t] != null) ||
        ContextTags.CLASS;
    }
    namespace = getNamespace(type, namespaces);
  }

  const name =
    options.name || bindingTemplate.tagMap[ContextTags.NAME] || cls.name;
  key = `${namespace}.${name}`;

  return key;
}
