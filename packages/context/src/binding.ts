// Copyright IBM Corp. and LoopBack contributors 2017,2020. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory from 'debug';
import {EventEmitter} from 'events';
import {bindingTemplateFor} from './binding-inspector';
import {BindingAddress, BindingKey} from './binding-key';
import {Context} from './context';
import {inspectInjections} from './inject';
import {createProxyWithInterceptors} from './interception-proxy';
import {invokeMethod} from './invocation';
import {JSONObject} from './json-types';
import {ContextTags} from './keys';
import {Provider} from './provider';
import {
  asResolutionOptions,
  ResolutionContext,
  ResolutionError,
  ResolutionOptions,
  ResolutionOptionsOrSession,
  ResolutionSession,
} from './resolution-session';
import {instantiateClass} from './resolver';
import {
  BoundValue,
  Constructor,
  isPromiseLike,
  MapObject,
  transformValueOrPromise,
  ValueOrPromise,
} from './value-promise';

const debug = debugFactory('loopback:context:binding');

/**
 * Scope for binding values
 */
export enum BindingScope {
  /**
   * The binding provides a value that is calculated each time. This will be
   * the default scope if not set.
   *
   * For example, with the following context hierarchy:
   *
   * - `app` (with a binding `'b1'` that produces sequential values 0, 1, ...)
   *   - req1
   *   - req2
   *
   * Now `'b1'` is resolved to a new value each time for `app` and its
   * descendants `req1` and `req2`:
   * - app.get('b1') ==> 0
   * - req1.get('b1') ==> 1
   * - req2.get('b1') ==> 2
   * - req2.get('b1') ==> 3
   * - app.get('b1') ==> 4
   */
  TRANSIENT = 'Transient',

  /**
   * @deprecated Finer-grained scopes such as `APPLICATION`, `SERVER`, or
   * `REQUEST` should be used instead to ensure the scope of sharing of resolved
   * binding values.
   *
   * The binding provides a value as a singleton within each local context. The
   * value is calculated only once per context and cached for subsequential
   * uses. Child contexts have their own value and do not share with their
   * ancestors.
   *
   * For example, with the following context hierarchy:
   *
   * - `app` (with a binding `'b1'` that produces sequential values 0, 1, ...)
   *   - req1
   *   - req2
   *
   * 1. `0` is the resolved value for `'b1'` within the `app` afterward
   * - app.get('b1') ==> 0 (always)
   *
   * 2. `'b1'` is resolved in `app` but not in `req1`, a new value `1` is
   * calculated and used for `req1` afterward
   * - req1.get('b1') ==> 1 (always)
   *
   * 3. `'b1'` is resolved in `app` but not in `req2`, a new value `2` is
   * calculated and used for `req2` afterward
   * - req2.get('b1') ==> 2 (always)
   *
   */
  CONTEXT = 'Context',

  /**
   * The binding provides a value as a singleton within the context hierarchy
   * (the owning context and its descendants). The value is calculated only
   * once for the owning context and cached for subsequential uses. Child
   * contexts share the same value as their ancestors.
   *
   * For example, with the following context hierarchy:
   *
   * - `app` (with a binding `'b1'` that produces sequential values 0, 1, ...)
   *   - req1
   *   - req2
   *
   * 1. `0` is the singleton for `app` afterward
   * - app.get('b1') ==> 0 (always)
   *
   * 2. `'b1'` is resolved in `app`, reuse it for `req1`
   * - req1.get('b1') ==> 0 (always)
   *
   * 3. `'b1'` is resolved in `app`, reuse it for `req2`
   * - req2.get('b1') ==> 0 (always)
   */
  SINGLETON = 'Singleton',

  /*
   * The following scopes are checked against the context hierarchy to find
   * the first matching context for a given scope in the chain. Resolved binding
   * values will be cached and shared on the scoped context. This ensures a
   * binding to have the same value for the scoped context.
   */

  /**
   * Application scope
   *
   * @remarks
   * The binding provides an application-scoped value within the context
   * hierarchy. Resolved value for this binding will be cached and shared for
   * the same application context (denoted by its scope property set to
   * `BindingScope.APPLICATION`).
   *
   */
  APPLICATION = 'Application',

  /**
   * Server scope
   *
   * @remarks
   * The binding provides an server-scoped value within the context hierarchy.
   * Resolved value for this binding will be cached and shared for the same
   * server context (denoted by its scope property set to
   * `BindingScope.SERVER`).
   *
   * It's possible that an application has more than one servers configured,
   * such as a `RestServer` and a `GrpcServer`. Both server contexts are created
   * with `scope` set to `BindingScope.SERVER`. Depending on where a binding
   * is resolved:
   * - If the binding is resolved from the RestServer or below, it will be
   * cached using the RestServer context as the key.
   * - If the binding is resolved from the GrpcServer or below, it will be
   * cached using the GrpcServer context as the key.
   *
   * The same binding can resolved/shared/cached for all servers, each of which
   * has its own value for the binding.
   */
  SERVER = 'Server',

  /**
   * Request scope
   *
   * @remarks
   * The binding provides an request-scoped value within the context hierarchy.
   * Resolved value for this binding will be cached and shared for the same
   * request context (denoted by its scope property set to
   * `BindingScope.REQUEST`).
   *
   * The `REQUEST` scope is very useful for controllers, services and artifacts
   * that want to have a single instance/value for a given request.
   */
  REQUEST = 'Request',
}

/**
 * Type of the binding source
 */
export enum BindingType {
  /**
   * A fixed value
   */
  CONSTANT = 'Constant',
  /**
   * A function to get the value
   */
  DYNAMIC_VALUE = 'DynamicValue',
  /**
   * A class to be instantiated as the value
   */
  CLASS = 'Class',
  /**
   * A provider class with `value()` function to get the value
   */
  PROVIDER = 'Provider',
  /**
   * A alias to another binding key with optional path
   */
  ALIAS = 'Alias',
}

/**
 * Binding source for `to`
 */
export type ConstantBindingSource<T> = {
  type: BindingType.CONSTANT;
  value: T;
};

/**
 * Binding source for `toDynamicValue`
 */
export type DynamicValueBindingSource<T> = {
  type: BindingType.DYNAMIC_VALUE;
  value: ValueFactory<T> | DynamicValueProviderClass<T>;
};

/**
 * Binding source for `toClass`
 */
export type ClassBindingSource<T> = {
  type: BindingType.CLASS;
  value: Constructor<T>;
};

/**
 * Binding source for `toProvider`
 */
export type ProviderBindingSource<T> = {
  type: BindingType.PROVIDER;
  value: Constructor<Provider<T>>;
};

/**
 * Binding source for `toAlias`
 */
export type AliasBindingSource<T> = {
  type: BindingType.ALIAS;
  value: BindingAddress<T>;
};

/**
 * Source for the binding, including the type and value
 */
export type BindingSource<T> =
  | ConstantBindingSource<T>
  | DynamicValueBindingSource<T>
  | ClassBindingSource<T>
  | ProviderBindingSource<T>
  | AliasBindingSource<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TagMap = MapObject<any>;

/**
 * Binding tag can be a simple name or name/value pairs
 */
export type BindingTag = TagMap | string;

/**
 * A function as the template to configure bindings
 */
export type BindingTemplate<T = unknown> = (binding: Binding<T>) => void;

/**
 * Information for a binding event
 */
export type BindingEvent = {
  /**
   * Event type
   */
  type: 'changed' | string;
  /**
   * Source binding that emits the event
   */
  binding: Readonly<Binding<unknown>>;
  /**
   * Operation that triggers the event
   */
  operation: 'tag' | 'scope' | 'value' | string;
};

/**
 * Event listeners for binding events
 */
export type BindingEventListener = (
  /**
   * Binding event
   */
  event: BindingEvent,
) => void;

/**
 * A factory function for `toDynamicValue`
 */
export type ValueFactory<T = unknown> = (
  resolutionCtx: ResolutionContext,
) => ValueOrPromise<T | undefined>;

/**
 * A class with a static `value` method as the factory function for
 * `toDynamicValue`.
 *
 * @example
 * ```ts
 * import {inject} from '@loopback/context';
 *
 * export class DynamicGreetingProvider {
 *   static value(@inject('currentUser') user: string) {
 *     return `Hello, ${user}`;
 *   }
 * }
 * ```
 */
export interface DynamicValueProviderClass<T = unknown>
  extends Constructor<unknown>,
    Function {
  value: (...args: BoundValue[]) => ValueOrPromise<T>;
}

/**
 * Adapt the ValueFactoryProvider class to be a value factory
 * @param provider - ValueFactoryProvider class
 */
function toValueFactory<T = unknown>(
  provider: DynamicValueProviderClass<T>,
): ValueFactory<T> {
  return resolutionCtx =>
    invokeMethod(provider, 'value', resolutionCtx.context, [], {
      skipInterceptors: true,
      session: resolutionCtx.options.session,
    });
}

/**
 * Check if the factory is a value factory provider class
 * @param factory - A factory function or a dynamic value provider class
 */
export function isDynamicValueProviderClass<T = unknown>(
  factory: unknown,
): factory is DynamicValueProviderClass<T> {
  // Not a class
  if (typeof factory !== 'function' || !String(factory).startsWith('class ')) {
    return false;
  }
  const valueMethod = (factory as DynamicValueProviderClass).value;
  return typeof valueMethod === 'function';
}

/**
 * Binding represents an entry in the `Context`. Each binding has a key and a
 * corresponding value getter.
 */
export class Binding<T = BoundValue> extends EventEmitter {
  /**
   * Key of the binding
   */
  public readonly key: string;

  /**
   * Map for tag name/value pairs
   */
  public readonly tagMap: TagMap = {};

  private _scope?: BindingScope;
  /**
   * Scope of the binding to control how the value is cached/shared
   */
  public get scope(): BindingScope {
    // Default to TRANSIENT if not set
    return this._scope ?? BindingScope.TRANSIENT;
  }

  /**
   * Type of the binding value getter
   */
  public get type(): BindingType | undefined {
    return this._source?.type;
  }

  private _cache: WeakMap<Context, ValueOrPromise<T>>;
  private _getValue?: ValueFactory<T>;

  /**
   * The original source value received from `to`, `toClass`, `toDynamicValue`,
   * `toProvider`, or `toAlias`.
   */
  private _source?: BindingSource<T>;

  public get source() {
    return this._source;
  }

  /**
   * For bindings bound via `toClass()`, this property contains the constructor
   * function of the class
   */
  public get valueConstructor(): Constructor<T> | undefined {
    return this._source?.type === BindingType.CLASS
      ? this._source?.value
      : undefined;
  }

  /**
   * For bindings bound via `toProvider()`, this property contains the
   * constructor function of the provider class
   */
  public get providerConstructor(): Constructor<Provider<T>> | undefined {
    return this._source?.type === BindingType.PROVIDER
      ? this._source?.value
      : undefined;
  }

  constructor(
    key: BindingAddress<T>,
    public isLocked: boolean = false,
  ) {
    super();
    BindingKey.validate(key);
    this.key = key.toString();
  }

  /**
   * Cache the resolved value by the binding scope
   * @param resolutionCtx - The resolution context
   * @param result - The calculated value for the binding
   */
  private _cacheValue(
    resolutionCtx: Context,
    result: ValueOrPromise<T>,
  ): ValueOrPromise<T> {
    // Initialize the cache as a weakmap keyed by context
    if (!this._cache) this._cache = new WeakMap<Context, ValueOrPromise<T>>();
    if (this.scope !== BindingScope.TRANSIENT) {
      this._cache.set(resolutionCtx!, result);
    }
    return result;
  }

  /**
   * Clear the cache
   */
  private _clearCache() {
    if (!this._cache) return;
    // WeakMap does not have a `clear` method
    this._cache = new WeakMap();
  }

  /**
   * Invalidate the binding cache so that its value will be reloaded next time.
   * This is useful to force reloading a cached value when its configuration or
   * dependencies are changed.
   * **WARNING**: The state held in the cached value will be gone.
   *
   * @param ctx - Context object
   */
  refresh(ctx: Context) {
    if (!this._cache) return;
    if (this.scope !== BindingScope.TRANSIENT) {
      const resolutionCtx = ctx.getResolutionContext(this);
      if (resolutionCtx != null) {
        this._cache.delete(resolutionCtx);
      }
    }
  }

  /**
   * This is an internal function optimized for performance.
   * Users should use `@inject(key)` or `ctx.get(key)` instead.
   *
   * Get the value bound to this key. Depending on `isSync`, this
   * function returns either:
   *  - the bound value
   *  - a promise of the bound value
   *
   * Consumers wishing to consume sync values directly should use `isPromiseLike`
   * to check the type of the returned value to decide how to handle it.
   *
   * @example
   * ```
   * const result = binding.getValue(ctx);
   * if (isPromiseLike(result)) {
   *   result.then(doSomething)
   * } else {
   *   doSomething(result);
   * }
   * ```
   *
   * @param ctx - Context for the resolution
   * @param session - Optional session for binding and dependency resolution
   */
  getValue(ctx: Context, session?: ResolutionSession): ValueOrPromise<T>;

  /**
   * Returns a value or promise for this binding in the given context. The
   * resolved value can be `undefined` if `optional` is set to `true` in
   * `options`.
   * @param ctx - Context for the resolution
   * @param options - Optional options for binding and dependency resolution
   */
  getValue(
    ctx: Context,
    options?: ResolutionOptions,
  ): ValueOrPromise<T | undefined>;

  // Implementation
  getValue(
    ctx: Context,
    optionsOrSession?: ResolutionOptionsOrSession,
  ): ValueOrPromise<T | undefined> {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Get value for binding %s', this.key);
    }

    const options = asResolutionOptions(optionsOrSession);
    const resolutionCtx = this.getResolutionContext(ctx, options);
    if (resolutionCtx == null) return undefined;

    // Keep a snapshot for proxy
    const savedSession =
      ResolutionSession.fork(options.session) ?? new ResolutionSession();

    // First check cached value for non-transient
    if (this._cache) {
      if (this.scope !== BindingScope.TRANSIENT) {
        if (resolutionCtx && this._cache.has(resolutionCtx)) {
          const value = this._cache.get(resolutionCtx)!;
          return this.getValueOrProxy(
            resolutionCtx,
            {...options, session: savedSession},
            value,
          );
        }
      }
    }
    const resolutionMetadata = {
      context: resolutionCtx!,
      binding: this,
      options,
    };
    if (typeof this._getValue === 'function') {
      const result = ResolutionSession.runWithBinding(
        s => {
          const optionsWithSession = {
            ...options,
            session: s,
            // Force to be the non-proxy version
            asProxyWithInterceptors: false,
          };
          // We already test `this._getValue` is a function. It's safe to assert
          // that `this._getValue` is not undefined.
          return this._getValue!({
            ...resolutionMetadata,
            options: optionsWithSession,
          });
        },
        this,
        options.session,
      );
      const value = this._cacheValue(resolutionCtx!, result);
      return this.getValueOrProxy(
        resolutionCtx,
        {...options, session: savedSession},
        value,
      );
    }
    // `@inject.binding` adds a binding without _getValue
    if (options.optional) return undefined;
    return Promise.reject(
      new ResolutionError(
        `No value was configured for binding ${this.key}.`,
        resolutionMetadata,
      ),
    );
  }

  private getValueOrProxy(
    resolutionCtx: Context,
    options: ResolutionOptions,
    value: ValueOrPromise<T>,
  ): ValueOrPromise<T> {
    const session = options.session!;
    session.pushBinding(this);
    return Binding.valueOrProxy(
      {
        context: resolutionCtx,
        binding: this,
        options,
      },
      value,
    );
  }

  /**
   * Locate and validate the resolution context
   * @param ctx - Current context
   * @param options - Resolution options
   */
  private getResolutionContext(ctx: Context, options: ResolutionOptions) {
    const resolutionCtx = ctx.getResolutionContext(this);
    switch (this.scope) {
      case BindingScope.APPLICATION:
      case BindingScope.SERVER:
      case BindingScope.REQUEST:
        if (resolutionCtx == null) {
          const msg =
            `Binding "${this.key}" in context "${ctx.name}" cannot` +
            ` be resolved in scope "${this.scope}"`;
          if (options.optional) {
            debug(msg);
            return undefined;
          }
          throw new Error(msg);
        }
    }

    const ownerCtx = ctx.getOwnerContext(this.key);
    if (ownerCtx != null && !ownerCtx.isVisibleTo(resolutionCtx!)) {
      const msg =
        `Resolution context "${resolutionCtx?.name}" does not have ` +
        `visibility to binding "${this.key} (scope:${this.scope})" in context "${ownerCtx.name}"`;
      if (options.optional) {
        debug(msg);
        return undefined;
      }
      throw new Error(msg);
    }
    return resolutionCtx;
  }

  /**
   * Lock the binding so that it cannot be rebound
   */
  lock(): this {
    this.isLocked = true;
    return this;
  }

  /**
   * Emit a `changed` event
   * @param operation - Operation that makes changes
   */
  private emitChangedEvent(operation: string) {
    const event: BindingEvent = {binding: this, operation, type: 'changed'};
    this.emit('changed', event);
  }

  /**
   * Tag the binding with names or name/value objects. A tag has a name and
   * an optional value. If not supplied, the tag name is used as the value.
   *
   * @param tags - A list of names or name/value objects. Each
   * parameter can be in one of the following forms:
   * - string: A tag name without value
   * - string[]: An array of tag names
   * - TagMap: A map of tag name/value pairs
   *
   * @example
   * ```ts
   * // Add a named tag `controller`
   * binding.tag('controller');
   *
   * // Add two named tags: `controller` and `rest`
   * binding.tag('controller', 'rest');
   *
   * // Add two tags
   * // - `controller` (name = 'controller')
   * // `{name: 'my-controller'}` (name = 'name', value = 'my-controller')
   * binding.tag('controller', {name: 'my-controller'});
   *
   * ```
   */
  tag(...tags: BindingTag[]): this {
    for (const t of tags) {
      if (typeof t === 'string') {
        this.tagMap[t] = t;
      } else if (Array.isArray(t)) {
        // Throw an error as TypeScript cannot exclude array from TagMap
        throw new Error(
          'Tag must be a string or an object (but not array): ' + t,
        );
      } else {
        Object.assign(this.tagMap, t);
      }
    }
    this.emitChangedEvent('tag');
    return this;
  }

  /**
   * Get an array of tag names
   */
  get tagNames() {
    return Object.keys(this.tagMap);
  }

  /**
   * Set the binding scope
   * @param scope - Binding scope
   */
  inScope(scope: BindingScope): this {
    if (this._scope !== scope) this._clearCache();
    this._scope = scope;
    this.emitChangedEvent('scope');
    return this;
  }

  /**
   * Apply default scope to the binding. It only changes the scope if it's not
   * set yet
   * @param scope - Default binding scope
   */
  applyDefaultScope(scope: BindingScope): this {
    if (!this._scope) {
      this.inScope(scope);
    }
    return this;
  }

  /**
   * Set the `_getValue` function
   * @param getValue - getValue function
   */
  private _setValueGetter(getValue: ValueFactory<T>) {
    // Clear the cache
    this._clearCache();
    this._getValue = resolutionCtx => {
      return getValue(resolutionCtx);
    };
    this.emitChangedEvent('value');
  }

  /**
   * Bind the key to a constant value. The value must be already available
   * at binding time, it is not allowed to pass a Promise instance.
   *
   * @param value - The bound value.
   *
   * @example
   *
   * ```ts
   * ctx.bind('appName').to('CodeHub');
   * ```
   */
  to(value: T): this {
    if (isPromiseLike(value)) {
      // Promises are a construct primarily intended for flow control:
      // In an algorithm with steps 1 and 2, we want to wait for the outcome
      // of step 1 before starting step 2.
      //
      // Promises are NOT a tool for storing values that may become available
      // in the future, depending on the success or a failure of a background
      // async task.
      //
      // Values stored in bindings are typically accessed only later,
      // in a different turn of the event loop or the Promise micro-queue.
      // As a result, when a promise is stored via `.to()` and is rejected
      // later, then more likely than not, there will be no error (catch)
      // handler registered yet, and Node.js will print
      // "Unhandled Rejection Warning".
      throw new Error(
        'Promise instances are not allowed for constant values ' +
          'bound via ".to()". Register an async getter function ' +
          'via ".toDynamicValue()" instead.',
      );
    }
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Bind %s to constant:', this.key, value);
    }
    this._source = {
      type: BindingType.CONSTANT,
      value,
    };
    this._setValueGetter(resolutionCtx => {
      return Binding.valueOrProxy(resolutionCtx, value);
    });
    return this;
  }

  /**
   * Bind the key to a computed (dynamic) value.
   *
   * @param factoryFn - The factory function creating the value.
   *   Both sync and async functions are supported.
   *
   * @example
   *
   * ```ts
   * // synchronous
   * ctx.bind('now').toDynamicValue(() => Date.now());
   *
   * // asynchronous
   * ctx.bind('something').toDynamicValue(
   *  async () => Promise.delay(10).then(doSomething)
   * );
   * ```
   */
  toDynamicValue(
    factory: ValueFactory<T> | DynamicValueProviderClass<T>,
  ): this {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Bind %s to dynamic value:', this.key, factory);
    }
    this._source = {
      type: BindingType.DYNAMIC_VALUE,
      value: factory,
    };

    let factoryFn: ValueFactory<T>;
    if (isDynamicValueProviderClass(factory)) {
      factoryFn = toValueFactory(factory);
    } else {
      factoryFn = factory;
    }
    this._setValueGetter(resolutionCtx => {
      const value = factoryFn(resolutionCtx);
      return Binding.valueOrProxy(resolutionCtx, value);
    });
    return this;
  }

  private static valueOrProxy<V>(
    resolutionCtx: ResolutionContext,
    value: ValueOrPromise<V>,
  ) {
    if (!resolutionCtx.options.asProxyWithInterceptors) return value;
    return createInterceptionProxyFromInstance(
      value,
      resolutionCtx.context,
      resolutionCtx.options.session,
    );
  }

  /**
   * Bind the key to a value computed by a Provider.
   *
   * * @example
   *
   * ```ts
   * export class DateProvider implements Provider<Date> {
   *   constructor(@inject('stringDate') private param: String){}
   *   value(): Date {
   *     return new Date(param);
   *   }
   * }
   * ```
   *
   * @param provider - The value provider to use.
   */
  toProvider(providerClass: Constructor<Provider<T>>): this {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Bind %s to provider %s', this.key, providerClass.name);
    }
    this._source = {
      type: BindingType.PROVIDER,
      value: providerClass,
    };
    this._setValueGetter(resolutionCtx => {
      const providerOrPromise = instantiateClass<Provider<T>>(
        providerClass,
        resolutionCtx.context,
        resolutionCtx.options.session,
      );
      const value = transformValueOrPromise(providerOrPromise, p => p.value());
      return Binding.valueOrProxy(resolutionCtx, value);
    });
    return this;
  }

  /**
   * Bind the key to an instance of the given class.
   *
   * @param ctor - The class constructor to call. Any constructor
   *   arguments must be annotated with `@inject` so that
   *   we can resolve them from the context.
   */
  toClass<C extends T & object>(ctor: Constructor<C>): this {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Bind %s to class %s', this.key, ctor.name);
    }
    this._source = {
      type: BindingType.CLASS,
      value: ctor,
    };
    this._setValueGetter(resolutionCtx => {
      const value = instantiateClass(
        ctor,
        resolutionCtx.context,
        resolutionCtx.options.session,
      );
      return Binding.valueOrProxy(resolutionCtx, value);
    });
    return this;
  }

  /**
   * Bind to a class optionally decorated with `@injectable`. Based on the
   * introspection of the class, it calls `toClass/toProvider/toDynamicValue`
   * internally. The current binding key will be preserved (not being overridden
   * by the key inferred from the class or options).
   *
   * This is similar to {@link createBindingFromClass} but applies to an
   * existing binding.
   *
   * @example
   *
   * ```ts
   * @injectable({scope: BindingScope.SINGLETON, tags: {service: 'MyService}})
   * class MyService {
   *   // ...
   * }
   *
   * const ctx = new Context();
   * ctx.bind('services.MyService').toInjectable(MyService);
   * ```
   *
   * @param ctor - A class decorated with `@injectable`.
   */
  toInjectable(
    ctor: DynamicValueProviderClass<T> | Constructor<T | Provider<T>>,
  ) {
    this.apply(bindingTemplateFor(ctor));
    return this;
  }

  /**
   * Bind the key to an alias of another binding
   * @param keyWithPath - Target binding key with optional path,
   * such as `servers.RestServer.options#apiExplorer`
   */
  toAlias(keyWithPath: BindingAddress<T>) {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Bind %s to alias %s', this.key, keyWithPath);
    }
    this._source = {
      type: BindingType.ALIAS,
      value: keyWithPath,
    };
    this._setValueGetter(({context, options}) => {
      return context.getValueOrPromise(keyWithPath, options);
    });
    return this;
  }

  /**
   * Unlock the binding
   */
  unlock(): this {
    this.isLocked = false;
    return this;
  }

  /**
   * Apply one or more template functions to set up the binding with scope,
   * tags, and other attributes as a group.
   *
   * @example
   * ```ts
   * const serverTemplate = (binding: Binding) =>
   *   binding.inScope(BindingScope.SINGLETON).tag('server');
   *
   * const serverBinding = new Binding<RestServer>('servers.RestServer1');
   * serverBinding.apply(serverTemplate);
   * ```
   * @param templateFns - One or more functions to configure the binding
   */
  apply(...templateFns: BindingTemplate<T>[]): this {
    for (const fn of templateFns) {
      fn(this);
    }
    return this;
  }

  /**
   * Convert to a plain JSON object
   */
  toJSON(): JSONObject {
    const json: JSONObject = {
      key: this.key,
      scope: this.scope,
      tags: this.tagMap,
      isLocked: this.isLocked,
    };
    if (this.type != null) {
      json.type = this.type;
    }
    switch (this._source?.type) {
      case BindingType.CLASS:
        json.valueConstructor = this._source?.value.name;
        break;
      case BindingType.PROVIDER:
        json.providerConstructor = this._source?.value.name;
        break;
      case BindingType.ALIAS:
        json.alias = this._source?.value.toString();
        break;
    }
    return json;
  }

  /**
   * Inspect the binding to return a json representation of the binding information
   * @param options - Options to control what information should be included
   */
  inspect(options: BindingInspectOptions = {}): JSONObject {
    options = {
      includeInjections: false,
      ...options,
    };
    const json = this.toJSON();
    if (options.includeInjections) {
      const injections = inspectInjections(this);
      if (Object.keys(injections).length) json.injections = injections;
    }
    return json;
  }

  /**
   * A static method to create a binding so that we can do
   * `Binding.bind('foo').to('bar');` as `new Binding('foo').to('bar')` is not
   * easy to read.
   * @param key - Binding key
   */
  static bind<V = unknown>(key: BindingAddress<V>): Binding<V> {
    return new Binding(key);
  }

  /**
   * Create a configuration binding for the given key
   *
   * @example
   * ```ts
   * const configBinding = Binding.configure('servers.RestServer.server1')
   *   .to({port: 3000});
   * ```
   *
   * @typeParam V Generic type for the configuration value (not the binding to
   * be configured)
   *
   * @param key - Key for the binding to be configured
   */
  static configure<V = unknown>(key: BindingAddress): Binding<V> {
    return new Binding(BindingKey.buildKeyForConfig<V>(key)).tag({
      [ContextTags.CONFIGURATION_FOR]: key.toString(),
    });
  }

  /**
   * The "changed" event is emitted by methods such as `tag`, `inScope`, `to`,
   * and `toClass`.
   *
   * @param eventName The name of the event - always `changed`.
   * @param listener The listener function to call when the event is emitted.
   */
  on(eventName: 'changed', listener: BindingEventListener): this;

  // The generic variant inherited from EventEmitter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string | symbol, listener: (...args: any[]) => void): this;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  /**
   * The "changed" event is emitted by methods such as `tag`, `inScope`, `to`,
   * and `toClass`.
   *
   * @param eventName The name of the event - always `changed`.
   * @param listener The listener function to call when the event is emitted.
   */
  once(eventName: 'changed', listener: BindingEventListener): this;

  // The generic variant inherited from EventEmitter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  once(event: string | symbol, listener: (...args: any[]) => void): this;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  once(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.once(event, listener);
  }
}

/**
 * Options for binding.inspect()
 */
export interface BindingInspectOptions {
  /**
   * The flag to control if injections should be inspected
   */
  includeInjections?: boolean;
}

function createInterceptionProxyFromInstance<T>(
  instOrPromise: ValueOrPromise<T>,
  context: Context,
  session?: ResolutionSession,
) {
  return transformValueOrPromise(instOrPromise, inst => {
    if (typeof inst !== 'object' || inst == null) return inst;
    return createProxyWithInterceptors(
      // Cast inst from `T` to `object`
      inst as unknown as object,
      context,
      session,
    ) as unknown as T;
  });
}
