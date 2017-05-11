// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, Context, Constructor} from '@loopback/context';
import {Component, Sequence} from '.';
import * as http from 'http';
import {SwaggerRouter} from './router/SwaggerRouter';
import {getApiSpec} from './router/metadata';

const debug = require('debug')('loopback:Application');

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

  // http handler which basically calls invoke sequence.run
  public async httpHandle(req: http.ServerRequest, res: http.ServerResponse) {
    // TODO(superkhau) determine whether a user defined sequence needs to run instead of default
    const sequence = new Sequence(this);
    await sequence.run(req, res);
  }

  public mountControllers(router: SwaggerRouter) {
    this.find('controllers.*').forEach(b => {
      debug('mounting controller %j', b.key);
      const ctor = b.valueConstructor;
      if (!ctor) {
        throw new Error(`The controller ${b.key} was not bound via .toClass()`);
      }

      const ctorFactory = (req: http.ServerRequest, res: http.ServerResponse, operationName: string) => {
        const requestContext = new Context(this);
        requestContext.bind('controller.current.ctor').to(ctor);
        requestContext.bind('controller.current.operation').to(operationName);
        requestContext.bind('http.request').to(req);
        requestContext.bind('http.response').to(res);
        return requestContext.get(b.key);
      };
      const apiSpec = getApiSpec(ctor);
      router.controller(ctorFactory, apiSpec);
    });
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
