// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/fastify
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, Constructor} from '@loopback/core';
import {givenHttpServerConfig, supertest} from '@loopback/testlab';
import {FastifyMixin, get} from '../..';

describe('@loopback/fastify (acceptance)', () => {
  let app: FastifyApplication;
  afterEach(() => app?.stop());

  it('supports parameter-less GET controller methods', async () => {
    class TestController {
      @get('/ping')
      ping() {
        return {success: true};
      }
    }
    await givenRunningAppWithController(TestController);
    await supertest(app.url)
      .get('/ping')
      .expect(200)
      .expect('content-type', /^application\/json/)
      .expect({success: true});
  });

  function givenRunningAppWithController(Controller: Constructor<unknown>) {
    app = new FastifyApplication();
    app.controller(Controller);
    return app.start();
  }

  class FastifyApplication extends FastifyMixin(Application) {
    constructor() {
      super({
        fastify: givenHttpServerConfig(),
      });
    }
  }
});
