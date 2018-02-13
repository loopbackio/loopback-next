// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MetadataInspector, ClassDecoratorFactory} from '@loopback/metadata';

import {BindingScope, Binding} from './binding';
import {Context} from './context';
import {Constructor, MapObject} from './value-promise';
import {Provider} from './provider';

const INJECTABLE_CLASS_KEY = 'injectable';

/**
 * Metadata for an injectable class
 */
export interface InjectableMetadata {
  /**
   * Type of the artifact. Valid values are:
   * - controller
   * - repository
   * - component
   * - provider
   * - server
   * - model
   * - dataSource
   * - class (default)
   */
  type?:
    | 'controller'
    | 'repository'
    | 'component'
    | 'provider'
    | 'server'
    | 'model'
    | 'dataSource'
    | 'class'
    | string; // Still allow string for extensibility
  /**
   * Name of the artifact, default to the class name
   */
  name?: string;
  /**
   * Binding key, default to `${type}.${name}`
   */
  key?: string;
  /**
   * Optional tags for the binding
   */
  tags?: string[] | MapObject;
  /**
   * Binding scope
   */
  scope?: BindingScope;
}

class InjectableDecoratorFactory extends ClassDecoratorFactory<
  InjectableMetadata
> {
  mergeWithInherited(inherited: InjectableMetadata, target: Function) {
    const spec = super.mergeWithInherited(inherited, target);
    if (!this.spec.name) {
      delete spec.name;
    }
    return spec;
  }
}
/**
 * Mark a class to be injectable or bindable for context based dependency
 * injection.
 *
 * @example
 * ```ts
 * @injectable({
 *   type: 'controller',
 *   name: 'my-controller',
 *   scope: BindingScope.SINGLETON},
 * )
 * export class MyController {
 * }
 * ```
 *
 * @param spec The metadata for bindings
 */
export function injectable(spec: InjectableMetadata = {}) {
  return InjectableDecoratorFactory.createDecorator(INJECTABLE_CLASS_KEY, spec);
}

/**
 * `@provider` as a shortcut of `@injectable({type: 'provider'})
 * @param spec
 */
export function provider(
  spec: InjectableMetadata = {},
): // tslint:disable-next-line:no-any
((target: Constructor<Provider<any>>) => void) {
  return injectable(Object.assign(spec, {type: 'provider'}));
}

/**
 * Get the metadata for an injectable class
 * @param target The target class
 */
export function getInjectableMetadata(
  target: Function,
): InjectableMetadata | undefined {
  return MetadataInspector.getClassMetadata<InjectableMetadata>(
    INJECTABLE_CLASS_KEY,
    target,
    {
      ownMetadataOnly: true,
    },
  );
}

export const TYPE_NAMESPACES: {[name: string]: string} = {
  controller: 'controllers',
  repository: 'repositories',
  model: 'models',
  dataSource: 'dataSources',
  server: 'servers',
  class: 'classes',
  provider: 'providers',
};

function getNamespace(type: string) {
  if (type in TYPE_NAMESPACES) {
    return TYPE_NAMESPACES[type];
  } else {
    return `${type}s`;
  }
}

/**
 * Bind the injectable class to a given context
 * @param ctx The context
 * @param cls The target class
 */
export function bindInjectable(
  ctx: Context,
  cls: Constructor<object>,
): Binding {
  const spec = getInjectableMetadata(cls);
  if (spec === undefined) {
    throw new Error(
      `Target class ${cls.name} is not decorated with @injectable`,
    );
  }
  const type = spec.type || 'class';
  const name = spec.name || cls.name;
  // Default binding key is ${plural form of the type}.${name}
  const key = spec.key || `${getNamespace(type)}.${name}`;
  const binding = ctx.bind(key);
  switch (type) {
    case 'provider':
      // tslint:disable-next-line:no-any
      binding.toProvider(cls as Constructor<Provider<any>>);
      break;
    default:
      binding.toClass(cls);
  }
  // Set tags if present
  if (Array.isArray(spec.tags)) {
    binding.tag(...spec.tags);
  } else if (spec.tags) {
    binding.tag(spec.tags);
  }
  // Set some tags for the metadata
  binding.tag({name, type, [type]: name});
  // Set scope if present
  if (spec.scope) {
    binding.inScope(spec.scope);
  }
  return binding;
}
