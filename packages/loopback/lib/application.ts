// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, Context, Constructor} from '@loopback/context';
import * as http from 'http';
import {SwaggerRouter} from './router/SwaggerRouter';
import {getApiSpec} from './router/metadata';
import {getAuthenticatedUser, Strategy} from '../../authentication';
import {authenticate, getAuthenticateMetadata, AuthenticationMetadata} from '../../authentication';

const debug = require('debug')('loopback:Application');

export class Application extends Context {
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
        //[rashmi] TODO calling getAuthenticatedUser() here only temporary until MiddleWare design/implementation is ready
        //the reason to call here is - this is the only place right now, where we have access to to request, app context and 
        //also where AppController's constructor is called where we need to inject the 'user' 
        return new Promise((resolve, reject) => {
          const metadata = getAuthenticateMetadata(ctor.prototype, operationName);
          var isAuthRequired;
          if (metadata != null) {
            isAuthRequired = true;
          } else {
            isAuthRequired = false;
          }
          this.getAuthenticatedUser(isAuthRequired, req).then((user) => {
            this.bind('authentication.user').to(user);
            requestContext.get(b.key).then((value) => {
              resolve(value);
            });
          });
        });
        //end of Temp code until MiddleWare design/implementation is ready
      };
      const apiSpec = getApiSpec(ctor);
      router.controller(ctorFactory, apiSpec);
    });
  }

  //[rashmi] TODO  getAuthenticatedUser function here only temporary until MiddleWare design/implementation is ready
  public async getAuthenticatedUser(isAuthRequired: boolean, request: http.ServerRequest) : Promise<Object> {
    const strategy = await this.get('authentication.strategy');
    const user = await getAuthenticatedUser(isAuthRequired, request, strategy as Strategy);
    return user;
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
