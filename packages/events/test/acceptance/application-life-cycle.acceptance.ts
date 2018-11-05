// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/events
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {EventSource, EventType} from '../..';

describe('application life cycle', () => {
  let app: Application;

  beforeEach(givenApplication);

  it('registers components as listeners', async () => {
    const myComponent = givenComponent(app);
    await app.start();
    expect(app.status).to.eql('started');
    expect(myComponent.status).to.eql('started');
    await app.stop();
    expect(app.status).to.eql('stopped');
    expect(myComponent.status).to.eql('stopped');
  });

  class MyComponent {
    status = '';
    async start() {
      this.status = 'started';
    }

    async stop() {
      this.status = 'stopped';
    }
  }

  function givenComponent(application: Application) {
    const myComponent = new MyComponent();
    application.subscribe(Application.START, (event, eventName) =>
      myComponent.start(),
    );
    application.subscribe(Application.STOP, (event, eventName) =>
      myComponent.stop(),
    );
    return myComponent;
  }

  interface ApplicationEvent {
    app: Application;
  }

  class Application extends EventSource {
    static START = EventType.create<ApplicationEvent>('start');
    static STOP = EventType.create<ApplicationEvent>('stop');

    status = '';

    async start() {
      await this.notify(Application.START, {app: this});
      this.status = 'started';
    }

    async stop() {
      await this.notify(Application.STOP, {app: this});
      this.status = 'stopped';
    }
  }

  function givenApplication() {
    app = new Application();
    return app;
  }
});
