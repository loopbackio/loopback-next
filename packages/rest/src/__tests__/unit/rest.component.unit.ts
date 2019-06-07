// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject, Provider} from '@loopback/context';
import {Application, CoreBindings, ProviderMap} from '@loopback/core';
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
  describe('Actions', () => {
    describe('Default implementation', () => {
      let app: Application;

      const EXPECTED_KEYS = [
        RestBindings.SequenceActions.LOG_ERROR,
        RestBindings.SequenceActions.FIND_ROUTE,
        RestBindings.SequenceActions.INVOKE_METHOD,
        RestBindings.SequenceActions.REJECT,
        RestBindings.SequenceActions.PARSE_PARAMS,
        RestBindings.SequenceActions.SEND,
      ];

      before(async () => {
        app = new Application();
        app.component(RestComponent);

        // Stub constructor requirements for some providers.
        app.bind(RestBindings.Http.CONTEXT).to(new Context());
        app
          .bind(RestBindings.HANDLER)
          .to(new HttpHandler(app, aRestServerConfig()));
      });

      for (const key of EXPECTED_KEYS) {
        it(`binds ${key}`, async () => {
          const result = await app.get(key);
          expect(result).to.be.Function();
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
          providers: ProviderMap = {
            [RestBindings.SequenceActions.LOG_ERROR.key]: CustomLogger,
          };
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
