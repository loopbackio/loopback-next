// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-passport
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  AuthenticateFn,
  AuthenticationBindings,
  AuthenticationComponent,
} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestApplication,
  RestBindings,
  RestServer,
  Send,
  SequenceHandler,
} from '@loopback/rest';
import {MyUser} from './user-repository';
import {StrategyAdapter} from '../../../strategy-adapter';
import {extensionFor} from '@loopback/core';

const SequenceActions = RestBindings.SequenceActions;

let app: RestApplication;
let server: RestServer;

export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS)
    protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) protected send: Send,
    @inject(SequenceActions.REJECT) protected reject: Reject,
    @inject(AuthenticationBindings.AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn,
  ) {}

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      const route = this.findRoute(request);

      //call authentication action
      await this.authenticateRequest(request);

      // Authentication successful, proceed to invoke controller
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (error) {
      this.reject(context, error);
      return;
    }
  }
}

export function simpleRestApplication(): RestApplication {
  app = new RestApplication();
  app.component(AuthenticationComponent);
  return app;
}

export async function configureApplication(
  authStrategy: StrategyAdapter<MyUser>,
  authKey: string,
) {
  server = await app.getServer(RestServer);
  app
    .bind(authKey)
    .to(authStrategy)
    .apply(
      extensionFor(
        AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
      ),
    );
  server.sequence(MySequence);
}
