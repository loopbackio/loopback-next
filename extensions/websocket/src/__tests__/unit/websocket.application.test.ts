import {expect} from '@loopback/testlab';
import {WebsocketApplication} from '../../websocket.application';

describe('WebsocketApplication', () => {
  let app: WebsocketApplication;

  before(async () => {
    app = new WebsocketApplication();
  });

  it('app bind io Server instance', async () => {
    expect(!!app.websocketServer).to.be.true();
  });
});
