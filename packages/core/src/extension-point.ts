// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  Binding,
  BindingFromClassOptions,
  BindingSpec,
  BindingTemplate,
  Constructor,
  Context,
  ContextTags,
  createBindingFromClass,
  createViewGetter,
  filterByTag,
  inject,
} from '@loopback/context';
import {CoreTags} from './keys';

/**
 * Decorate a class as a named extension point. If the decoration is not
 * present, the name of the class will be used.
 *
 * @example
 * ```ts
 * import {extensionPoint} from '@loopback/core';
 *
 * @extensionPoint(GREETER_EXTENSION_POINT_NAME)
 * export class GreetingService {
 *   // ...
 * }
 * ```
 *
 * @param name - Name of the extension point
 */
export function extensionPoint(name: string, ...specs: BindingSpec[]) {
  return bind({tags: {[CoreTags.EXTENSION_POINT]: name}}, ...specs);
}

/**
 * Shortcut to inject extensions for the given extension point.
 *
 * @example
 * ```ts
 * import {Getter} from '@loopback/context';
 * import {extensionPoint, extensions} from '@loopback/core';
 *
 * @extensionPoint(GREETER_EXTENSION_POINT_NAME)
 * export class GreetingService {
 *  constructor(
 *    @extensions() // Inject extensions for the extension point
 *    private getGreeters: Getter<Greeter[]>,
 *    // ...
 * ) {
 *   // ...
 * }
 * ```
 *
 * @param extensionPointName - Name of the extension point. If not supplied, we
 * use the `name` tag from the extension point binding or the class name of the
 * extension point class. If a class needs to inject extensions from multiple
 * extension points, use different `extensionPointName` for different types of
 * extensions.
 */
export function extensions(extensionPointName?: string) {
  return inject('', {decorator: '@extensions'}, (ctx, injection, session) => {
    extensionPointName =
      extensionPointName ||
      inferExtensionPointName(injection.target, session.currentBinding);

    const bindingFilter = extensionFilter(extensionPointName);
    return createViewGetter(
      ctx,
      bindingFilter,
      injection.metadata.bindingComparator,
      session,
    );
  });
}

/**
 * Infer the extension point name from binding tags/class name
 * @param injectionTarget - Target class or prototype
 * @param currentBinding - Current binding
 */
function inferExtensionPointName(
  injectionTarget: object,
  currentBinding?: Readonly<Binding<unknown>>,
): string {
  if (currentBinding) {
    const name =
      currentBinding.tagMap[CoreTags.EXTENSION_POINT] ||
      currentBinding.tagMap[ContextTags.NAME];

    if (name) return name;
  }

  let target: Function;
  if (typeof injectionTarget === 'function') {
    // Constructor injection
    target = injectionTarget;
  } else {
    // Injection on the prototype
    target = injectionTarget.constructor;
  }
  return target.name;
}

/**
 * A factory function to create binding filter for extensions of a named
 * extension point
 * @param extensionPointName - Name of the extension point
 */
export function extensionFilter(extensionPointName: string) {
  return filterByTag({
    [CoreTags.EXTENSION_FOR]: extensionPointName,
  });
}

/**
 * A factory function to create binding template for extensions of the given
 * extension point
 * @param extensionPointName - Name of the extension point
 */
export function extensionFor(extensionPointName: string): BindingTemplate {
  return binding => binding.tag({[CoreTags.EXTENSION_FOR]: extensionPointName});
}

/**
 * Register an extension for the given extension point to the context
 * @param context - Context object
 * @param extensionPointName - Name of the extension point
 * @param extensionClass - Class or a provider for an extension
 * @param options - Options Options for the creation of binding from class
 */
export function addExtension(
  context: Context,
  extensionPointName: string,
  extensionClass: Constructor<unknown>,
  options?: BindingFromClassOptions,
) {
  const binding = createBindingFromClass(extensionClass, options).apply(
    extensionFor(extensionPointName),
  );
  context.add(binding);
  return binding;
}
