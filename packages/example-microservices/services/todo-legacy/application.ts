import { Application } from '@loopback/core';
import { TodoController } from './controllers/todo-controller';
import {
  juggler,
  DataSourceConstructor,
  DefaultCrudRepository
} from '@loopback/repository';
import { datasources } from './datasources';

export class TodoApplication extends Application {
  private _startTime: Date;

  constructor() {
    super();
    const app = this;
    let ds = datasources['ds'];
    // Controller bindings
    app.controller(TodoController);

    let datasource = new DataSourceConstructor('ds', ds);
    app.bind('datasources.ds').to(datasource);

    // Server protocol bindings
    app.bind('servers.http.enabled').to(true);
    app.bind('servers.https.enabled').to(true);
  }

  async start() : Promise<void> {
    this._startTime = new Date();
    return super.start();
  }

  async info() {
    const port: Number = await this.get('http.port');

    return JSON.stringify({
      appName: "todo-legecy",
      uptime: Date.now() - this._startTime.getTime(),
      url: 'http://127.0.0.1:' + port,
    }, null, 2);
  }
}
