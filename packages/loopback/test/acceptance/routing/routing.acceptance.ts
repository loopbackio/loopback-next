// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, Server, api, OpenApiSpec, ParameterObject, OperationObject} from '../../..';
import {Client} from './../../support/client';
import {expect} from 'testlab';

/* # Feature: Routing
 * - In order to build REST APIs
 * - As an app developer
 * - I want the framework to handle the request to controller method routing
 * - So that I can focus on my implementing the methods and not the routing
 */
describe('Routing', () => {
  /* ## Scenario: Basic Usage
   * - Given an `Application`
   * - And a single `Controller`
   * - And a single `Method` that returns the `msg` query field
   * - When I make a request to the `Application` with `?msg=hello%20world`
   * - Then I get the result `hello world` from the `Method`
   */
  it('supports basic usage', async () => {
    const app = givenAnApplication();

    const controller = givenControllerInApp(app, {
      basePath: '/',
      paths: {},
    });

    givenMethod(controller, 'get', '/echo',
      {
        'x-operation-name': 'echo',
        parameters: [
          // the type cast is not required, but improves Intellisense
          <ParameterObject> {
            name: 'msg',
            in: 'query',
            type: 'string',
          },
        ],
        responses: {
          '200': {
            type: 'string',
          },
        },
      },
      async function(msg: string): Promise<string> {
        return msg;
      });

      const result = await whenIMakeRequestTo(app).get('/?msg=hello%20world');

      // Then I get the result `hello world` from the `Method`
      expect(result).to.have.property('body', 'hello world');
  });

  /* ===== HELPERS ===== */

  function givenAnApplication() {
    return new Application();
  }

  let apiSpec: OpenApiSpec;
  function givenControllerInApp(app: Application, spec: OpenApiSpec) {
    apiSpec = spec;

    @api(spec)
    class TestController {
    }

    // TODO(bajtos) make the controller name configurable
    app.bind('controllers.myController').to(TestController);
    return TestController;
  }

  function givenMethod(controllerCtor: Function, verb: string, path: string, spec: OperationObject, handler: Function) {
    expect(spec).to.have.property('x-operation-name');

    apiSpec.paths[path] = apiSpec.paths[path] || {};
    apiSpec.paths[path][verb] = apiSpec.paths[path][verb] || {};
    apiSpec.paths[path][verb] = spec;
    controllerCtor.prototype[spec['x-operation-name']] = handler;
  }

  function whenIMakeRequestTo(app: Application): Client {
    const server = new Server({port: 0});
    server.bind('application.myApp').to(app);
    return new Client(server);
  }
});
