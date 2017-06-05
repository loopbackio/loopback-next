// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application, Server, api,
  OpenApiSpec, ParameterObject,
  ServerRequest, ServerResponse, parseOperationArgs, writeResultToResponse,
} from '../../../src';
import {ParsedRequest, OperationArgs, FindRoute, InvokeMethod} from '../../../src/internal-types';
import {expect, Client, createClientForServer} from '@loopback/testlab';
import {givenOpenApiSpec} from '@loopback/openapi-spec-builder';
import {inject, Constructor, Context} from '@loopback/context';

/* # Feature: Routing
 * - In order to build REST APIs
 * - As an app developer
 * - I want the framework to handle the request to controller method routing
 * - So that I can focus on my implementing the methods and not the routing
 */
describe('Routing', () => {
  it('injects user defined sequence', () => {
    const app = givenAnApplication();
    app.bind('application.name').to('SequenceApp');

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

    class MySequence {
      constructor(
        @inject('findRoute')
        protected findRoute: FindRoute,
        @inject('invokeMethod')
        protected invoke: InvokeMethod) {
      }

      async run(req: ParsedRequest, res: ServerResponse) {
          // TODO Fix - temporarily added this rule since ts-lint complains this for 'spec'
          // tslint:disable:no-shadowed-variable
          const { controller, methodName, spec, pathParams } = this.findRoute(req);
          // tslint:enable:no-shadowed-variable
          const args = await parseOperationArgs(req, spec, pathParams);
          const result = await this.invoke(controller, methodName, args);
          writeResultToResponse(res, result);
        }
    }
    app.bind('sequence').toClass(MySequence);

    return whenIMakeRequestTo(app).get('/name')
      .expect('SequenceApp');
  });

  /* ===== HELPERS ===== */

  function givenAnApplication() {
    return new Application();
  }

  function givenControllerInApp<T>(app: Application, controller: Constructor<T>) {
    app.controller(controller);
  }

  function whenIMakeRequestTo(app: Application): Client {
    const server = new Server(app, {port: 0});
    return createClientForServer(server);
  }
});
