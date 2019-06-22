// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, ContextView, filterByTag} from '../..';

let app: Context;
let server: Context;

describe('ContextView', () => {
  let viewOfControllers: ContextView;
  beforeEach(givenViewForControllers);

  it('watches matching bindings', async () => {
    // We have server: ServerController, app: AppController
    expect(await getControllers()).to.eql([
      'ServerController',
      'AppController',
    ]);
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

  function givenViewForControllers() {
    givenServerWithinAnApp();
    viewOfControllers = server.createView(filterByTag('controller'));
    givenController(server, 'ServerController');
    givenController(app, 'AppController');
  }

  function givenController(context: Context, name: string) {
    class MyController {
      name = name;
    }
    context
      .bind(`controllers.${name}`)
      .toClass(MyController)
      .tag('controller');
  }

  async function getControllers() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await viewOfControllers.values()).map((v: any) => v.name);
  }
});

function givenServerWithinAnApp() {
  app = new Context('app');
  server = new Context(app, 'server');
}
