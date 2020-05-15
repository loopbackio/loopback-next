// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  BindingType,
  Component,
  Context,
  CoreBindings,
  createBindingFromClass,
  inject,
  Provider,
} from '@loopback/core';
import {expect, stubExpressContext} from '@loopback/testlab';
import {
  HttpHandler,
  LogError,
  Request,
  RestBindings,
  RestComponent,
  RestComponentConfig,
  RestServer,
} from '../..';
import {aRestServerConfig} from '../helpers';

const SequenceActions = RestBindings.SequenceActions;
describe('RestComponent', () => {
  describe('Providers', () => {
    describe('Default implementation', () => {
      let app: Application;
      let comp: Component;

      const EXPECTED_KEYS = [
        RestBindings.SequenceActions.LOG_ERROR.key,
        RestBindings.SequenceActions.FIND_ROUTE.key,
        RestBindings.SequenceActions.INVOKE_METHOD.key,
        RestBindings.SequenceActions.REJECT.key,
        RestBindings.SequenceActions.PARSE_PARAMS.key,
        RestBindings.SequenceActions.SEND.key,
      ];

      before(async () => {
        app = new Application();
        app.component(RestComponent);

        // Stub constructor requirements for some providers.
        app.bind(RestBindings.Http.CONTEXT).to(new Context());
        app
          .bind(RestBindings.HANDLER)
          .to(new HttpHandler(app, aRestServerConfig()));

        comp = await app.get<Component>('components.RestComponent');
      });

      for (const key of EXPECTED_KEYS) {
        it(`binds ${key}`, async () => {
          await app.get(key);
          const expected = comp.bindings?.find(b => b.key === key);
          expect(expected?.type).to.eql(BindingType.DYNAMIC_VALUE);
        });
      }
    });

    describe('LOG_ERROR', () => {
      it('matches expected argument signature', async () => {
        const app = new Application();
        app.component(RestComponent);
        const server = await app.getServer(RestServer);
        const logError = await server.get<LogError>(SequenceActions.LOG_ERROR);
        expect(logError.length).to.equal(3); // (err, statusCode, request)
      });

      it('can be customized by extending RestComponent', async () => {
        let lastLog = 'logError() was not called';

        class CustomRestComponent extends RestComponent {
          bindings = [
            createBindingFromClass(CustomLogger, {
              key: RestBindings.SequenceActions.LOG_ERROR,
            }),
          ];
          constructor(
            @inject(CoreBindings.APPLICATION_INSTANCE) application: Application,
            @inject(CoreBindings.APPLICATION_CONFIG)
            config?: RestComponentConfig,
          ) {
            super(application, config);
          }
        }

        class CustomLogger implements Provider<LogError> {
          value() {
            return (err: Error, statusCode: number, request: Request) => {
              lastLog = `${request.url} ${statusCode} ${err.message}`;
            };
          }
        }

        const app = new Application();
        app.component(CustomRestComponent);
        const server = await app.getServer(RestServer);
        const logError = await server.get<LogError>(SequenceActions.LOG_ERROR);
        const expressContext = stubExpressContext({url: '/'});
        logError(new Error('test-error'), 400, expressContext.request);

        expect(lastLog).to.equal('/ 400 test-error');
      });
    });
  });
});
