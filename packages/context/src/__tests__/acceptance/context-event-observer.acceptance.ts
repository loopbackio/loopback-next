// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Binding,
  Context,
  ContextEventType,
  ContextObserver,
  filterByTag,
} from '../..';

let app: Context;
let server: Context;

describe('ContextEventObserver', () => {
  let contextObserver: MyObserverForControllers;
  beforeEach(givenControllerObserver);

  it('receives notifications of matching binding events', async () => {
    const controllers = await getControllers();
    // We have server: ServerController, app: AppController
    // NOTE: The controllers are not guaranteed to be ['ServerController`,
    // 'AppController'] as the events are emitted by two context objects and
    // they are processed asynchronously
    expect(controllers).to.containEql('ServerController');
    expect(controllers).to.containEql('AppController');
    server.unbind('controllers.ServerController');
    // Now we have app: AppController
    expect(await getControllers()).to.eql(['AppController']);
    app.unbind('controllers.AppController');
    // All controllers are gone from the context chain
    expect(await getControllers()).to.eql([]);
    // Add a new controller - server: AnotherServerController
    givenController(server, 'AnotherServerController');
    expect(await getControllers()).to.eql(['AnotherServerController']);
  });

  class MyObserverForControllers implements ContextObserver {
    controllers: Set<string> = new Set();
    filter = filterByTag('controller');
    observe(event: ContextEventType, binding: Readonly<Binding<unknown>>) {
      if (event === 'bind') {
        this.controllers.add(binding.tagMap.name);
      } else if (event === 'unbind') {
        this.controllers.delete(binding.tagMap.name);
      }
    }
  }

  function givenControllerObserver() {
    givenServerWithinAnApp();
    contextObserver = new MyObserverForControllers();
    server.subscribe(contextObserver);
    givenController(server, 'ServerController');
    givenController(app, 'AppController');
  }

  function givenController(ctx: Context, controllerName: string) {
    class MyController {
      name = controllerName;
    }
    ctx
      .bind(`controllers.${controllerName}`)
      .toClass(MyController)
      .tag('controller', {name: controllerName});
  }

  async function getControllers() {
    return new Promise<string[]>(resolve => {
      // Wrap it inside `setImmediate` to make the events are triggered
      setImmediate(() => resolve(Array.from(contextObserver.controllers)));
    });
  }
});

function givenServerWithinAnApp() {
  app = new Context('app');
  server = new Context(app, 'server');
}
