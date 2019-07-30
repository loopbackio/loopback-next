// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingScope,
  Constructor,
  Context,
  instantiateClass,
  invokeMethod,
  ValueOrPromise,
} from '@loopback/context';
import {CoreBindings} from '@loopback/core';
import {OperationObject} from '@loopback/openapi-v3';
import * as HttpErrors from 'http-errors';
import {OperationArgs, OperationRetval} from '../types';
import {BaseRoute} from './base-route';

/*
 * A controller instance with open properties/methods
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 * A route backed by a controller
 */
export class ControllerRoute<T> extends BaseRoute {
  protected readonly _controllerCtor: ControllerClass<T>;
  protected readonly _controllerName: string;
  protected readonly _methodName: string;
  protected readonly _controllerFactory: ControllerFactory<T>;

  /**
   * Construct a controller based route
   * @param verb - http verb
   * @param path - http request path
   * @param spec - OpenAPI operation spec
   * @param controllerCtor - Controller class
   * @param controllerFactory - A factory function to create a controller instance
   * @param methodName - Controller method name, default to `x-operation-name`
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
    /*
     * Bind current controller to the request context in `SINGLETON` scope.
     * Within the same request, we always get the same instance of the
     * current controller when `requestContext.get(CoreBindings.CONTROLLER_CURRENT)`
     * is invoked.
     *
     * Please note the controller class itself can be bound to other scopes,
     * such as SINGLETON or TRANSIENT (default) in the application or server
     * context.
     *
     * - SINGLETON: all requests share the same instance of a given controller
     * - TRANSIENT: each request has its own instance of a given controller
     */
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
    return invokeMethod(controller, this._methodName, requestContext, args);
  }
}

/**
 * Create a controller factory function for a given binding key
 * @param key - Binding key
 */
export function createControllerFactoryForBinding<T>(
  key: string,
): ControllerFactory<T> {
  return ctx => ctx.get<T>(key);
}

/**
 * Create a controller factory function for a given class
 * @param controllerCtor - Controller class
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
 * @param controllerCtor - Controller instance
 */
export function createControllerFactoryForInstance<T>(
  controllerInst: T,
): ControllerFactory<T> {
  return ctx => controllerInst;
}
