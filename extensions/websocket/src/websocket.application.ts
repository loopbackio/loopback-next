import {Application, ApplicationConfig} from '@loopback/core';
import {WebsocketBindings} from './keys';
import {WebsocketComponent} from './websocket.component';
import {WebsocketServer} from './websocket.server';

export class WebsocketApplication extends Application {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    this.component(WebsocketComponent);
  }

  get websocketServer(): WebsocketServer {
    return this.getSync<WebsocketServer>(WebsocketBindings.SERVER);
  }

  public async start(): Promise<void> {
    await this.websocketServer.start();
  }

  public async stop(): Promise<void> {
    await this.websocketServer.stop();
  }
}
