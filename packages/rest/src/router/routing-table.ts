// Copyright IBM Corp. 2017, 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  OperationObject,
  ParameterObject,
  PathObject,
  SchemasObject,
} from '@loopback/openapi-v3-types';
import {
  BindingScope,
  Context,
  Constructor,
  invokeMethod,
  instantiateClass,
  ValueOrPromise,
} from '@loopback/context';
import * as HttpErrors from 'http-errors';
import {inspect} from 'util';

import {
  Request,
  PathParameterValues,
  OperationArgs,
  OperationRetval,
} from '../types';

import {ControllerSpec} from '@loopback/openapi-v3';

import * as assert from 'assert';
const debug = require('debug')('loopback:rest:routing-table');

import {CoreBindings} from '@loopback/core';
import {validateApiPath} from './openapi-path';
import {TrieRouter} from './trie-router';

/**
 * A controller instance with open properties/methods
 */
// tslint:disable-next-line:no-any
export type ControllerInstance = {[name: string]: any} & object;

/**
 * A factory function to create controller instances synchronously or
 * asynchronously
 */
export type ControllerFactory<T extends ControllerInstance> = (
  ctx: Context,
) => ValueOrPromise<T>;

/**
 * Controller class
 */
export type ControllerClass<T extends ControllerInstance> = Constructor<T>;

/**
 * Interface for router implementation
 */
export interface RestRouter {
  /**
   * Add a route to the router
   * @param route A route entry
   */
  add(route: RouteEntry): void;

  /**
   * Find a matching route for the given http request
   * @param request Http request
   * @returns The resolved route, if not found, `undefined` is returned
   */
  find(request: Request): ResolvedRoute | undefined;

  /**
   * List all routes
   */
  list(): RouteEntry[];
}

/**
 * Routing table
 */
export class RoutingTable {
  constructor(private readonly _router: RestRouter = new TrieRouter()) {}

  /**
   * Register a controller as the route
   * @param spec
   * @param controllerCtor
   * @param controllerFactory
   */
  registerController<T>(
    spec: ControllerSpec,
    controllerCtor: ControllerClass<T>,
    controllerFactory?: ControllerFactory<T>,
  ) {
    assert(
      typeof spec === 'object' && !!spec,
      'API specification must be a non-null object',
    );
    if (!spec.paths || !Object.keys(spec.paths).length) {
      return;
    }

    debug('Registering Controller with API %s', inspect(spec, {depth: null}));

    const basePath = spec.basePath || '/';
    for (const p in spec.paths) {
      for (const verb in spec.paths[p]) {
        const opSpec: OperationObject = spec.paths[p][verb];
        const fullPath = RoutingTable.joinPath(basePath, p);
        const route = new ControllerRoute(
          verb,
          fullPath,
          opSpec,
          controllerCtor,
          controllerFactory,
        );
        this.registerRoute(route);
      }
    }
  }

  static joinPath(basePath: string, path: string) {
    const fullPath = [basePath, path]
      .join('/') // Join by /
      .replace(/(\/){2,}/g, '/') // Remove extra /
      .replace(/\/$/, '') // Remove trailing /
      .replace(/^(\/)?/, '/'); // Add leading /
    return fullPath;
  }

  /**
   * Register a route
   * @param route A route entry
   */
  registerRoute(route: RouteEntry) {
    // TODO(bajtos) handle the case where opSpec.parameters contains $ref
    // See https://github.com/strongloop/loopback-next/issues/435
    if (debug.enabled) {
      debug(
        'Registering route %s %s -> %s(%s)',
        route.verb.toUpperCase(),
        route.path,
        route.describe(),
        describeOperationParameters(route.spec),
      );
    }

    validateApiPath(route.path);
    this._router.add(route);
  }

  describeApiPaths(): PathObject {
    const paths: PathObject = {};

    for (const route of this._router.list()) {
      if (!paths[route.path]) {
        paths[route.path] = {};
      }

      paths[route.path][route.verb] = route.spec;
    }

    return paths;
  }

  /**
   * Map a request to a route
   * @param request
   */
  find(request: Request): ResolvedRoute {
    debug('Finding route %s for %s %s', request.method, request.path);

    const found = this._router.find(request);

    if (found) {
      debug('Route matched: %j', found);
      return found;
    }

    debug('No route found for %s %s', request.method, request.path);
    throw new HttpErrors.NotFound(
      `Endpoint "${request.method} ${request.path}" not found.`,
    );
  }
}

/**
 * An entry in the routing table
 */
export interface RouteEntry {
  /**
   * http verb
   */
  readonly verb: string;
  /**
   * http path
   */
  readonly path: string;
  /**
   * OpenAPI operation spec
   */
  readonly spec: OperationObject;

  /**
   * Update bindings for the request context
   * @param requestContext
   */
  updateBindings(requestContext: Context): void;

  /**
   * A handler to invoke the resolved controller method
   * @param requestContext
   * @param args
   */
  invokeHandler(
    requestContext: Context,
    args: OperationArgs,
  ): Promise<OperationRetval>;

  describe(): string;
}

/**
 * A route with path parameters resolved
 */
export interface ResolvedRoute extends RouteEntry {
  readonly pathParams: PathParameterValues;

  /**
   * Server/application wide schemas shared by multiple routes,
   * e.g. model schemas. This is a temporary workaround for
   * missing support for $ref references, see
   * https://github.com/strongloop/loopback-next/issues/435
   */
  readonly schemas: SchemasObject;
}

/**
 * Base implementation of RouteEntry
 */
export abstract class BaseRoute implements RouteEntry {
  public readonly verb: string;

  /**
   * Construct a new route
   * @param verb http verb
   * @param path http request path pattern
   * @param spec OpenAPI operation spec
   */
  constructor(
    verb: string,
    public readonly path: string,
    public readonly spec: OperationObject,
  ) {
    this.verb = verb.toLowerCase();
  }

  abstract updateBindings(requestContext: Context): void;

  abstract invokeHandler(
    requestContext: Context,
    args: OperationArgs,
  ): Promise<OperationRetval>;

  describe(): string {
    return `"${this.verb} ${this.path}"`;
  }
}

export function createResolvedRoute(
  route: RouteEntry,
  pathParams: PathParameterValues,
): ResolvedRoute {
  return Object.create(route, {
    pathParams: {
      writable: false,
      value: pathParams,
    },
    schemas: {
      value: {},
    },
  });
}

export class Route extends BaseRoute {
  constructor(
    verb: string,
    path: string,
    public readonly spec: OperationObject,
    protected readonly _handler: Function,
  ) {
    super(verb, path, spec);
  }

  describe(): string {
    return this._handler.name || super.describe();
  }

  updateBindings(requestContext: Context) {
    // no-op
  }

  async invokeHandler(
    requestContext: Context,
    args: OperationArgs,
  ): Promise<OperationRetval> {
    return await this._handler(...args);
  }
}

/**
 * A route backed by a controller
 */
export class ControllerRoute<T> extends BaseRoute {
  protected readonly _controllerCtor: ControllerClass<T>;
  protected readonly _controllerName: string;
  protected readonly _methodName: string;
  protected readonly _controllerFactory: ControllerFactory<T>;

  /**
   * Construct a controller based route
   * @param verb http verb
   * @param path http request path
   * @param spec OpenAPI operation spec
   * @param controllerCtor Controller class
   * @param controllerFactory A factory function to create a controller instance
   * @param methodName Controller method name, default to `x-operation-name`
   */
  constructor(
    verb: string,
    path: string,
    spec: OperationObject,
    controllerCtor: ControllerClass<T>,
    controllerFactory?: ControllerFactory<T>,
    methodName?: string,
  ) {
    const controllerName = spec['x-controller-name'] || controllerCtor.name;
    methodName = methodName || spec['x-operation-name'];

    if (!methodName) {
      throw new Error(
        'methodName must be provided either via the ControllerRoute argument ' +
          'or via "x-operation-name" extension field in OpenAPI spec. ' +
          `Operation: "${verb} ${path}" ` +
          `Controller: ${controllerName}.`,
      );
    }

    super(
      verb,
      path,
      // Add x-controller-name and x-operation-name if not present
      Object.assign(
        {
          'x-controller-name': controllerName,
          'x-operation-name': methodName,
          tags: [controllerName],
        },
        spec,
      ),
    );

    this._controllerFactory =
      controllerFactory || createControllerFactoryForClass(controllerCtor);
    this._controllerCtor = controllerCtor;
    this._controllerName = controllerName || controllerCtor.name;
    this._methodName = methodName;
  }

  describe(): string {
    return `${this._controllerName}.${this._methodName}`;
  }

  updateBindings(requestContext: Context) {
    requestContext
      .bind(CoreBindings.CONTROLLER_CURRENT)
      .toDynamicValue(() => this._controllerFactory(requestContext))
      .inScope(BindingScope.SINGLETON);
    requestContext.bind(CoreBindings.CONTROLLER_CLASS).to(this._controllerCtor);
    requestContext
      .bind(CoreBindings.CONTROLLER_METHOD_NAME)
      .to(this._methodName);
  }

  async invokeHandler(
    requestContext: Context,
    args: OperationArgs,
  ): Promise<OperationRetval> {
    const controller = await requestContext.get<ControllerInstance>(
      'controller.current',
    );
    if (typeof controller[this._methodName] !== 'function') {
      throw new HttpErrors.NotFound(
        `Controller method not found: ${this.describe()}`,
      );
    }
    // Invoke the method with dependency injection
    return await invokeMethod(
      controller,
      this._methodName,
      requestContext,
      args,
    );
  }
}

function describeOperationParameters(opSpec: OperationObject) {
  return ((opSpec.parameters as ParameterObject[]) || [])
    .map(p => (p && p.name) || '')
    .join(', ');
}

/**
 * Create a controller factory function for a given binding key
 * @param key Binding key
 */
export function createControllerFactoryForBinding<T>(
  key: string,
): ControllerFactory<T> {
  return ctx => ctx.get<T>(key);
}

/**
 * Create a controller factory function for a given class
 * @param controllerCtor Controller class
 */
export function createControllerFactoryForClass<T>(
  controllerCtor: ControllerClass<T>,
): ControllerFactory<T> {
  return async ctx => {
    // By default, we get an instance of the controller from the context
    // using `controllers.<controllerName>` as the key
    let inst = await ctx.get<T>(`controllers.${controllerCtor.name}`, {
      optional: true,
    });
    if (inst === undefined) {
      inst = await instantiateClass<T>(controllerCtor, ctx);
    }
    return inst;
  };
}

/**
 * Create a controller factory function for a given instance
 * @param controllerCtor Controller instance
 */
export function createControllerFactoryForInstance<T>(
  controllerInst: T,
): ControllerFactory<T> {
  return ctx => controllerInst;
}
