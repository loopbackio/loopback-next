// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingFilter} from './binding-filter';
import {BindingKey} from './binding-key';
import {Context} from './context';
import {ContextView} from './context-view';
import {assertTargetType, inject, Injection, InjectionMetadata} from './inject';
import {ResolutionSession} from './resolution-session';
import {getDeepProperty, ValueOrPromise} from './value-promise';

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
 * @param configPath - Optional property path of the config. If is `''` or not
 * present, the `config` object will be returned.
 * @param metadata - Optional metadata to help the injection
 */
export function config(configPath?: string, metadata?: InjectionMetadata) {
  configPath = configPath || '';
  metadata = Object.assign(
    {configPath, decorator: '@config', optional: true},
    metadata,
  );
  return inject('', metadata, resolveFromConfig);
}

export namespace config {
  /**
   * `@inject.getter` decorator to inject a config getter function
   * @param configPath - Optional property path of the config object
   * @param metadata - Injection metadata
   */
  export const getter = function injectConfigGetter(
    configPath?: string,
    metadata?: InjectionMetadata,
  ) {
    configPath = configPath || '';
    metadata = Object.assign(
      {configPath, decorator: '@config.getter', optional: true},
      metadata,
    );
    return inject('', metadata, resolveAsGetterFromConfig);
  };

  /**
   * `@inject.view` decorator to inject a config context view to allow dynamic
   * changes in configuration
   * @param configPath - Optional property path of the config object
   * @param metadata - Injection metadata
   */
  export const view = function injectConfigView(
    configPath?: string,
    metadata?: InjectionMetadata,
  ) {
    configPath = configPath || '';
    metadata = Object.assign(
      {configPath, decorator: '@config.view', optional: true},
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
  const bindingKey = getCurrentBindingKey(session);
  // Return `undefined` if no current binding is present
  if (!bindingKey) return undefined;
  const meta = injection.metadata;
  return ctx.getConfigAsValueOrPromise(bindingKey, meta.configPath, {
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
  const bindingKey = getCurrentBindingKey(session);
  // We need to clone the session for the getter as it will be resolved later
  const forkedSession = ResolutionSession.fork(session);
  const meta = injection.metadata;
  return async function getter() {
    // Return `undefined` if no current binding is present
    if (!bindingKey) return undefined;
    return ctx.getConfigAsValueOrPromise(bindingKey, meta.configPath, {
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
  const bindingKey = getCurrentBindingKey(session);
  // Return `undefined` if no current binding is present
  if (!bindingKey) return undefined;
  const view = new ConfigView(
    ctx,
    binding =>
      binding.key === BindingKey.buildKeyForConfig(bindingKey).toString(),
    injection.metadata.configPath,
  );
  view.open();
  return view;
}

/**
 * A subclass of `ContextView` to handle dynamic configuration as its
 * `values()` honors the `configPath`.
 */
class ConfigView extends ContextView {
  constructor(
    ctx: Context,
    filter: BindingFilter,
    private configPath?: string,
  ) {
    super(ctx, filter);
  }

  /**
   * Get values for the configuration with a property path
   * @param session - Resolution session
   */
  async values(session?: ResolutionSession) {
    const configValues = await super.values(session);
    const configPath = this.configPath;
    if (!configPath) return configValues;
    return configValues.map(v => getDeepProperty(v, configPath));
  }
}
