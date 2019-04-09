// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-greeter-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ClassDecoratorFactory,
  createViewGetter,
  filterByTag,
  inject,
  MetadataInspector,
} from '@loopback/context';
import {EXTENSION_POINT_NAME} from './keys';

/**
 * Decorate a class as a named extension point. If the decoration is not
 * present, the name of the class will be used.
 *
 * TODO: to be promoted to `@loopback/core` module.
 * @param name Name of the extension point
 */
export function extensionPoint(name: string) {
  return ClassDecoratorFactory.createDecorator(EXTENSION_POINT_NAME, {name});
}

/**
 * Shortcut to inject extensions for the given extension point.
 *
 * TODO: to be promoted to `@loopback/core` module possibly as
 * `@inject.extensions`.
 *
 * @param extensionPoint Name of the extension point. If not supplied, we use
 * the name from `@extensionPoint` or the class name of the extension point.
 */
export function extensions(extensionPointName?: string) {
  return inject('', {decorator: '@extensions'}, (ctx, injection, session) => {
    // Find the key of the target binding
    if (!session.currentBinding) return undefined;

    if (!extensionPointName) {
      let target: Function;
      if (typeof injection.target === 'function') {
        // Constructor injection
        target = injection.target;
      } else {
        // Injection on the prototype
        target = injection.target.constructor;
      }
      const meta:
        | {name: string}
        | undefined = MetadataInspector.getClassMetadata(
        EXTENSION_POINT_NAME,
        target,
      );
      extensionPointName = (meta && meta.name) || target.name;
    }

    const bindingFilter = filterByTag({extensionPoint: extensionPointName});
    return createViewGetter(ctx, bindingFilter, session);
  });
}

/**
 * Shortcut to inject configuration for the target binding. To be promoted
 * as `@inject.config` in `@loopback/context` module.
 *
 * See https://github.com/strongloop/loopback-next/pull/2259
 */
export function configuration() {
  return inject(
    '',
    {decorator: '@inject.config', optional: true},
    (ctx, injection, session) => {
      // Find the key of the target binding
      if (!session.currentBinding) return undefined;
      const key = session.currentBinding!.key;
      return ctx.get(`${key}.options`, {
        session,
        optional: injection.metadata.optional,
      });
    },
  );
}
