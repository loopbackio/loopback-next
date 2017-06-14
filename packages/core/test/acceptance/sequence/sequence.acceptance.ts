// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application, Server, api,
  OpenApiSpec, ParameterObject,
  ServerRequest, ServerResponse, parseOperationArgs,
  writeResultToResponse, ParsedRequest, OperationArgs,
  FindRoute, InvokeMethod,
} from '../../..';
import {expect, Client, createClientForServer} from '@loopback/testlab';
import {givenOpenApiSpec} from '@loopback/openapi-spec-builder';
import {inject, Constructor, Context} from '@loopback/context';

/* # Feature: Sequence
 * - In order to build REST APIs
 * - As a framework developer
 * - I want the framework to handle default sequence and user defined sequence
 */
describe('Sequence - ', () => {
  let app: Application;
  beforeEach(givenAppWithController);

  it('default sequence', () => {
    return whenIMakeRequestTo().get('/name')
      .expect('SequenceApp');
  });

  it('user defined sequence', () => {
    class MySequence {
      constructor(
        @inject('findRoute')
        protected findRoute: FindRoute,
        @inject('invokeMethod')
        protected invoke: InvokeMethod) {
      }

      async run(req: ParsedRequest, res: ServerResponse) {
          const { controller, methodName, spec: routeSpec, pathParams } = this.findRoute(req);
          const args = await parseOperationArgs(req, routeSpec, pathParams);
          const result = await this.invoke(controller, methodName, args);
          // Prepend 'MySequence' to the result of invoke to allow for
          // execution verification of this user-defined sequence
          writeResultToResponse(res, `MySequence ${result}`);
      }
    }
    // bind user defined sequence
    app.sequence(MySequence);

    return whenIMakeRequestTo().get('/name')
      .expect('MySequence SequenceApp');
  });

  function givenAppWithController() {
    givenAnApplication();
    app.bind('application.name').to('SequenceApp');

    const apispec = givenOpenApiSpec()
      .withOperation('get', '/name', {
        'x-operation-name': 'getName',
        responses: {
          '200': {
            type: 'string',
          },
        },
      })
      .build();

    @api(apispec)
    class InfoController {
      constructor(@inject('application.name') public appName: string) {
      }

      async getName(): Promise<string> {
        return this.appName;
      }
    }
    givenControllerInApp(InfoController);
  }
  /* ===== HELPERS ===== */

  function givenAnApplication() {
    app = new Application();
  }

  function givenControllerInApp<T>(controller: Constructor<T>) {
    app.controller(controller);
  }

  function whenIMakeRequestTo(): Client {
    const server = new Server(app, {port: 0});
    return createClientForServer(server);
  }
});
