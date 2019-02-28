// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, CoreBindings} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {RestComponent, RestBindings, RestServer} from '../../..';

describe('RestComponent', () => {
  let app: Application;

  before(givenApplicationWithRestComponent);

  it('adds bindings of RestServer', async () => {
    expect(app.contains(`${CoreBindings.SERVERS}.RestServer`)).to.be.true();
    expect(await app.getServer(RestServer)).to.be.instanceOf(RestServer);
  });

  it('adds body parser bindings to RestServer', async () => {
    expect(app.contains(RestBindings.REQUEST_BODY_PARSER)).to.be.false();
    const server = await app.getServer(RestServer);
    expect(server.contains(RestBindings.REQUEST_BODY_PARSER)).to.be.true();
  });

  function givenApplicationWithRestComponent() {
    app = new Application();
    app.component(RestComponent);
  }
});
