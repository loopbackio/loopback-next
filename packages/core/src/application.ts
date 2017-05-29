// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, Context, Constructor} from '@loopback/context';
import { Component, Sequence, OpenApiSpec } from '.';
import * as http from 'http';
import {SwaggerRouter} from './router/swagger-router';
import {getApiSpec} from './router/metadata';

const debug = require('debug')('loopback:core:application');

export interface ControllerDefinition {
  controller: string;
  spec: OpenApiSpec;
}

export class Application extends Context {
  constructor(public appConfig?: AppConfig) {
    super();

    if (appConfig && appConfig.components) {
      for (const component of appConfig.components) {
        // TODO(superkhau): Need to figure a way around this hack,
        //  `componentClassName.constructor.name` + `componentClassName.name`
        //  doesn't work
        const componentClassName = component.toString().split(' ')[1];
        this.bind(`component.${componentClassName}`).toClass(component);
      }
    }

    if (appConfig && appConfig.sequences) {
      for (const sequence of appConfig.sequences) {
        // TODO(superkhau): Need to figure a way around this hack,
        //   `componentClassName.constructor.name` + `componentClassName.name`
        //   doesn't work
        const sequenceClassName = sequence.toString().split(' ')[1];
        this.bind(`sequence.${sequenceClassName}`).toClass(sequence);
      }
    }
  }

  public mountControllers(router: SwaggerRouter) {
    this.find('controllers.*').forEach(b => {
      debug('mounting controller %j', b.key);
      const ctor = b.valueConstructor;
      if (!ctor) {
        throw new Error(`The controller ${b.key} was not bound via .toClass()`);
      }

      const ctorFactory = (req: http.ServerRequest, res: http.ServerResponse, operationName: string) => {
        const requestContext = this.createRequestContext(req, res);
        this.bindRouteInfo(requestContext, b.key, operationName);
        return requestContext.get(b.key);
      };
      const apiSpec = getApiSpec(ctor);
      router.controller(ctorFactory, apiSpec);
    });
  }

  public getAllControllers(): ControllerDefinition[] {
    return this.find('controllers.*').map(b => {
      const ctor = b.valueConstructor;
      if (!ctor) {
        throw new Error(`The controller ${b.key} was not bound via .toClass()`);
      }

      const apiSpec = getApiSpec(ctor);

      return {
        controller: b.key,
        spec: apiSpec,
      };
    });
  }

  public createRequestContext(req: http.ServerRequest, res: http.ServerResponse): Context {
    const requestContext = new Context(this);
    requestContext.bind('http.request').to(req);
    requestContext.bind('http.response').to(res);
    return requestContext;
  }

  public bindRouteInfo(requestContext: Context, controllerName: string, methodName: string) {
    const ctor = requestContext.getBinding(controllerName).valueConstructor;
    if (!ctor) {
      throw new Error(
        `The controller ${controllerName} was not bound via .toClass()`);
    }

    requestContext.bind('controller.current.ctor').to(ctor);
    requestContext.bind('controller.current.operation').to(methodName);
  }

  /**
   * Register a controller class with this application.
   *
   * @param controllerCtor {Function} The controller class (constructor function).
   * @return {Binding} The newly created binding, you can use the reference to further
   * modify the binding, e.g. lock the value to prevent further modifications.
   *
   * ```ts
   * @spec(apiSpec)
   * class MyController {
   * }
   * app.controller(MyController).lock();
   * ```
   */
  public controller<T>(controllerCtor: Constructor<T>): Binding {
    return this.bind('controllers.' + controllerCtor.name).toClass(controllerCtor);
  }
}

export interface AppConfig {
  components: Array<Constructor<Component>>;
  sequences: Array<Constructor<Sequence>>;
}
