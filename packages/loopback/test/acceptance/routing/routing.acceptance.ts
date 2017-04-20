// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, Server, api, OpenApiSpec, ParameterObject, OperationObject} from '../../..';
import {Client} from './../../support/client';
import {expect} from 'testlab';
import {givenOpenApiSpec} from '../../support/OpenApiSpecBuilder';
import {inject} from '@loopback/context';

/* # Feature: Routing
 * - In order to build REST APIs
 * - As an app developer
 * - I want the framework to handle the request to controller method routing
 * - So that I can focus on my implementing the methods and not the routing
 */
describe('Routing', () => {
  /* ## Scenario: Basic Usage
   * - Given an `Application`
   * - And API spec describing a single endpoint accepting a "msg" query field
   * - And a controller implementing that API spec
   * - When I make a request to the `Application` with `?msg=hello%20world`
   * - Then I get the result `hello world` from the `Method`
   */
  it('supports basic usage', async () => {
    const app = givenAnApplication();

    const spec = givenOpenApiSpec()
      .withOperation('get', '/echo', {
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
      })
      .build();

    @api(spec)
    class EchoController {
      async echo(msg: string): Promise<string> {
        return msg;
      }
    }
    givenControllerInApp(app, EchoController);

    const result = await whenIMakeRequestTo(app).get('/echo?msg=hello%20world');

    // Then I get the result `hello world` from the `Method`
    expect(result).to.have.property('body', 'hello world');
  });

  it('injects controller constructor arguments', async () => {
    const app = givenAnApplication();
    app.bind('application.name').to('TestApp');

    const spec = givenOpenApiSpec()
      .withOperation('get', '/name', {
        'x-operation-name': 'getName',
        responses: {
          '200': {
            type: 'string',
          },
        },
      })
      .build();

    @api(spec)
    class InfoController {
      constructor(@inject('application.name') public appName: string) {
      }

      async getName(): Promise<string> {
        return this.appName;
      }
    }
    givenControllerInApp(app, InfoController);

    const result = await whenIMakeRequestTo(app).get('/name');

    expect(result).to.have.property('body', 'TestApp');
  });

  /* ===== HELPERS ===== */

  function givenAnApplication() {
    return new Application();
  }

  function givenControllerInApp(app: Application, controller: new(...args) => Object) {
    app.controller(controller);
  }

  function whenIMakeRequestTo(app: Application): Client {
    const server = new Server({port: 0});
    server.bind('applications.myApp').to(app);
    return new Client(server);
  }
});
