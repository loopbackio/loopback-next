import {Application} from '@loopback/core';
import {AuthenticationComponent, BindingKeys} from '@loopback/authentication';
import {validateApiSpec} from '@loopback/testlab'
import {MyAuthStrategyProvider} from './providers/auth-strategy';
import {HelloWorldController} from './controllers/hello-world';
import {MySequence} from './sequence';

export function createApp(): Application {
  const app = new Application({
    components: [AuthenticationComponent],
   });
  app.bind(BindingKeys.Authentication.STRATEGY)
    .toProvider(MyAuthStrategyProvider);
  app.sequence(MySequence);
  app.controller(HelloWorldController);
  return app;
}

