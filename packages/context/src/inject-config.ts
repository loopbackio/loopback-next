// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingFilter} from './binding-filter';
import {BindingAddress, BindingKey} from './binding-key';
import {Context} from './context';
import {ContextView} from './context-view';
import {assertTargetType, inject, Injection, InjectionMetadata} from './inject';
import {ResolutionSession} from './resolution-session';
import {getDeepProperty, ValueOrPromise} from './value-promise';

/**
 * Injection metadata for `@config.*`
 */
export interface ConfigInjectionMetadata extends InjectionMetadata {
  /**
   * Property path to retrieve the configuration of the target binding, for
   * example, `rest.host`.
   */
  propertyPath?: string;
  /**
   * Customize the target binding key from which the configuration is fetched.
   * If not specified, the configuration of the current binding that contains
   * the injection is used.
   */
  fromBinding?: BindingAddress;
}

/**
 * Inject a property from `config` of the current binding. If no corresponding
 * config value is present, `undefined` will be injected as the configuration
 * binding is resolved with `optional: true` by default.
 *
 * @example
 * ```ts
 * class Store {
 *   constructor(
 *     @config('x') public optionX: number,
 *     @config('y') public optionY: string,
 *   ) { }
 * }
 *
 * ctx.configure('store1', { x: 1, y: 'a' });
 * ctx.configure('store2', { x: 2, y: 'b' });
 *
 * ctx.bind('store1').toClass(Store);
 * ctx.bind('store2').toClass(Store);
 *
 * const store1 = ctx.getSync('store1');
 * expect(store1.optionX).to.eql(1);
 * expect(store1.optionY).to.eql('a');
 *
 * const store2 = ctx.getSync('store2');
 * expect(store2.optionX).to.eql(2);
 * expect(store2.optionY).to.eql('b');
 * ```
 *
 * @param propertyPath - Optional property path of the config. If is `''` or not
 * present, the `config` object will be returned.
 * @param metadata - Optional metadata to help the injection
 */
export function config(
  propertyPath?: string | ConfigInjectionMetadata,
  metadata?: ConfigInjectionMetadata,
) {
  propertyPath = propertyPath || '';
  if (typeof propertyPath === 'object') {
    metadata = propertyPath;
    propertyPath = '';
  }
  metadata = Object.assign(
    {propertyPath, decorator: '@config', optional: true},
    metadata,
  );
  return inject('', metadata, resolveFromConfig);
}

export namespace config {
  /**
   * `@inject.getter` decorator to inject a config getter function
   * @param propertyPath - Optional property path of the config object
   * @param metadata - Injection metadata
   */
  export const getter = function injectConfigGetter(
    propertyPath?: string | ConfigInjectionMetadata,
    metadata?: ConfigInjectionMetadata,
  ) {
    propertyPath = propertyPath || '';
    if (typeof propertyPath === 'object') {
      metadata = propertyPath;
      propertyPath = '';
    }
    metadata = Object.assign(
      {propertyPath, decorator: '@config.getter', optional: true},
      metadata,
    );
    return inject('', metadata, resolveAsGetterFromConfig);
  };

  /**
   * `@inject.view` decorator to inject a config context view to allow dynamic
   * changes in configuration
   * @param propertyPath - Optional property path of the config object
   * @param metadata - Injection metadata
   */
  export const view = function injectConfigView(
    propertyPath?: string | ConfigInjectionMetadata,
    metadata?: ConfigInjectionMetadata,
  ) {
    propertyPath = propertyPath || '';
    if (typeof propertyPath === 'object') {
      metadata = propertyPath;
      propertyPath = '';
    }
    metadata = Object.assign(
      {propertyPath, decorator: '@config.view', optional: true},
      metadata,
    );
    return inject('', metadata, resolveAsViewFromConfig);
  };
}

/**
 * Get the key for the current binding on which dependency injection is
 * performed
 * @param session - Resolution session
 */
function getCurrentBindingKey(session: ResolutionSession) {
  // The current binding is not set if `instantiateClass` is invoked directly
  return session.currentBinding && session.currentBinding.key;
}

/**
 * Get the target binding key from which the configuration should be resolved
 * @param injection - Injection
 * @param session - Resolution session
 */
function getTargetBindingKey(injection: Injection, session: ResolutionSession) {
  return injection.metadata.fromBinding || getCurrentBindingKey(session);
}

/**
 * Resolver for `@config`
 * @param ctx - Context object
 * @param injection - Injection metadata
 * @param session - Resolution session
 */
function resolveFromConfig(
  ctx: Context,
  injection: Injection,
  session: ResolutionSession,
): ValueOrPromise<unknown> {
  const bindingKey = getTargetBindingKey(injection, session);
  // Return `undefined` if no current binding is present
  if (!bindingKey) return undefined;
  const meta = injection.metadata;
  return ctx.getConfigAsValueOrPromise(bindingKey, meta.propertyPath, {
    session,
    optional: meta.optional,
  });
}

/**
 * Resolver from `@config.getter`
 * @param ctx - Context object
 * @param injection - Injection metadata
 * @param session - Resolution session
 */
function resolveAsGetterFromConfig(
  ctx: Context,
  injection: Injection,
  session: ResolutionSession,
) {
  assertTargetType(injection, Function, 'Getter function');
  const bindingKey = getTargetBindingKey(injection, session);
  // We need to clone the session for the getter as it will be resolved later
  const forkedSession = ResolutionSession.fork(session);
  const meta = injection.metadata;
  return async function getter() {
    // Return `undefined` if no current binding is present
    if (!bindingKey) return undefined;
    return ctx.getConfigAsValueOrPromise(bindingKey, meta.propertyPath, {
      session: forkedSession,
      optional: meta.optional,
    });
  };
}

/**
 * Resolver for `@config.view`
 * @param ctx - Context object
 * @param injection - Injection metadata
 * @param session - Resolution session
 */
function resolveAsViewFromConfig(
  ctx: Context,
  injection: Injection,
  session: ResolutionSession,
) {
  assertTargetType(injection, ContextView);
  const bindingKey = getTargetBindingKey(injection, session);
  // Return `undefined` if no current binding is present
  if (!bindingKey) return undefined;
  const view = new ConfigView(
    ctx,
    binding =>
      binding.key === BindingKey.buildKeyForConfig(bindingKey).toString(),
    injection.metadata.propertyPath,
  );
  view.open();
  return view;
}

/**
 * A subclass of `ContextView` to handle dynamic configuration as its
 * `values()` honors the `propertyPath`.
 */
class ConfigView extends ContextView {
  constructor(
    ctx: Context,
    filter: BindingFilter,
    private propertyPath?: string,
  ) {
    super(ctx, filter);
  }

  /**
   * Get values for the configuration with a property path
   * @param session - Resolution session
   */
  async values(session?: ResolutionSession) {
    const configValues = await super.values(session);
    const propertyPath = this.propertyPath;
    if (!propertyPath) return configValues;
    return configValues.map(v => getDeepProperty(v, propertyPath));
  }
}
