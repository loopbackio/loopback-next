import {
  Application,
  BindingScope,
  Component,
  CoreBindings,
  inject,
  ProviderMap,
} from '@loopback/core';
import {WebsocketBooter} from './booters';
import {WebsocketBindings} from './keys';
import {
  WebsocketInvokeMethodProvider,
  WebsocketRejectProvider,
  WebsocketSendProvider,
} from './providers';
import {DefaultWebsocketSequence} from './websocket.sequence';
import {WebsocketServer} from './websocket.server';

export class WebsocketComponent implements Component {
  booters = [WebsocketBooter];
  providers: ProviderMap = {
    [WebsocketBindings.INVOKE_METHOD.key]: WebsocketInvokeMethodProvider,
    [WebsocketBindings.SEND_METHOD.key]: WebsocketSendProvider,
    [WebsocketBindings.REJECT_METHOD.key]: WebsocketRejectProvider,
  };

  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app
      .bind(WebsocketBindings.SERVER)
      .toClass(WebsocketServer)
      .inScope(BindingScope.SINGLETON);

    app.bind(WebsocketBindings.REQUEST_LISTENER).to(() => {});

    app.bind(WebsocketBindings.SEQUENCE).toClass(DefaultWebsocketSequence);
  }
}
