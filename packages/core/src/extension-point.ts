// Copyright IBM Corp. 2017,2020. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  asResolutionOptions,
  assertTargetType,
  Binding,
  BindingFilter,
  BindingFromClassOptions,
  BindingSpec,
  BindingTemplate,
  Constructor,
  Context,
  ContextTags,
  ContextView,
  createBindingFromClass,
  createViewGetter,
  filterByTag,
  includesTagValue,
  inject,
  injectable,
  Injection,
  InjectionMetadata,
  ResolutionSession,
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
  return injectable({tags: {[CoreTags.EXTENSION_POINT]: name}}, ...specs);
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
 * @param metadata - Optional injection metadata
 */
export function extensions(
  extensionPointName?: string,
  metadata?: InjectionMetadata,
) {
  return inject(
    '',
    {...metadata, decorator: '@extensions'},
    (ctx, injection, session) => {
      assertTargetType(injection, Function, 'Getter function');
      const bindingFilter = filterByExtensionPoint(
        injection,
        session,
        extensionPointName,
      );
      return createViewGetter(
        ctx,
        bindingFilter,
        injection.metadata.bindingComparator,
        {...metadata, ...asResolutionOptions(session)},
      );
    },
  );
}

export namespace extensions {
  /**
   * Inject a `ContextView` for extensions of the extension point. The view can
   * then be listened on events such as `bind`, `unbind`, or `refresh` to react
   * on changes of extensions.
   *
   * @example
   * ```ts
   * import {extensionPoint, extensions} from '@loopback/core';
   *
   * @extensionPoint(GREETER_EXTENSION_POINT_NAME)
   * export class GreetingService {
   *  constructor(
   *    @extensions.view() // Inject a context view for extensions of the extension point
   *    private greetersView: ContextView<Greeter>,
   *    // ...
   * ) {
   *   // ...
   * }
   * ```
   * @param extensionPointName - Name of the extension point. If not supplied, we
   * use the `name` tag from the extension point binding or the class name of the
   * extension point class. If a class needs to inject extensions from multiple
   * extension points, use different `extensionPointName` for different types of
   * extensions.
   * @param metadata - Optional injection metadata
   */
  export function view(
    extensionPointName?: string,
    metadata?: InjectionMetadata,
  ) {
    return inject(
      '',
      {...metadata, decorator: '@extensions.view'},
      (ctx, injection, session) => {
        assertTargetType(injection, ContextView);
        const bindingFilter = filterByExtensionPoint(
          injection,
          session,
          extensionPointName,
        );
        return ctx.createView(
          bindingFilter,
          injection.metadata.bindingComparator,
          metadata,
        );
      },
    );
  }

  /**
   * Inject an array of resolved extension instances for the extension point.
   * The list is a snapshot of registered extensions when the injection is
   * fulfilled. Extensions added or removed afterward won't impact the list.
   *
   * @example
   * ```ts
   * import {extensionPoint, extensions} from '@loopback/core';
   *
   * @extensionPoint(GREETER_EXTENSION_POINT_NAME)
   * export class GreetingService {
   *  constructor(
   *    @extensions.list() // Inject an array of extensions for the extension point
   *    private greeters: Greeter[],
   *    // ...
   * ) {
   *   // ...
   * }
   * ```
   * @param extensionPointName - Name of the extension point. If not supplied, we
   * use the `name` tag from the extension point binding or the class name of the
   * extension point class. If a class needs to inject extensions from multiple
   * extension points, use different `extensionPointName` for different types of
   * extensions.
   * @param metadata - Optional injection metadata
   */
  export function list(
    extensionPointName?: string,
    metadata?: InjectionMetadata,
  ) {
    return inject(
      '',
      {...metadata, decorator: '@extensions.instances'},
      (ctx, injection, session) => {
        assertTargetType(injection, Array);
        const bindingFilter = filterByExtensionPoint(
          injection,
          session,
          extensionPointName,
        );
        const viewForExtensions = new ContextView(
          ctx,
          bindingFilter,
          injection.metadata.bindingComparator,
        );
        return viewForExtensions.resolve({
          ...metadata,
          ...asResolutionOptions(session),
        });
      },
    );
  }
}

/**
 * Create a binding filter for `@extensions.*`
 * @param injection - Injection object
 * @param session - Resolution session
 * @param extensionPointName - Extension point name
 */
function filterByExtensionPoint(
  injection: Readonly<Injection<unknown>>,
  session: ResolutionSession,
  extensionPointName?: string,
) {
  extensionPointName =
    extensionPointName ??
    inferExtensionPointName(injection.target, session.currentBinding);
  return extensionFilter(extensionPointName);
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
 * @param extensionPointNames - A list of names of extension points
 */
export function extensionFilter(
  ...extensionPointNames: string[]
): BindingFilter {
  return filterByTag({
    [CoreTags.EXTENSION_FOR]: includesTagValue(...extensionPointNames),
  });
}

/**
 * A factory function to create binding template for extensions of the given
 * extension point
 * @param extensionPointNames - Names of the extension point
 */
export function extensionFor(
  ...extensionPointNames: string[]
): BindingTemplate {
  return binding => {
    if (extensionPointNames.length === 0) return;
    let extensionPoints = binding.tagMap[CoreTags.EXTENSION_FOR];
    // Normalize extensionPoints to string[]
    if (extensionPoints == null) {
      extensionPoints = [];
    } else if (typeof extensionPoints === 'string') {
      extensionPoints = [extensionPoints];
    }

    // Add extension points
    for (const extensionPointName of extensionPointNames) {
      if (!extensionPoints.includes(extensionPointName)) {
        extensionPoints.push(extensionPointName);
      }
    }
    if (extensionPoints.length === 1) {
      // Keep the value as string for backward compatibility
      extensionPoints = extensionPoints[0];
    }
    binding.tag({[CoreTags.EXTENSION_FOR]: extensionPoints});
  };
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
