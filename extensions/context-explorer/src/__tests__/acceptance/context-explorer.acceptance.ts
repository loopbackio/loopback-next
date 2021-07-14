// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/context-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RestApplication, RestServerConfig} from '@loopback/rest';
import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {
  ContextExplorerBindings,
  ContextExplorerComponent,
  ContextExplorerConfig,
} from '../..';

describe('Context Explorer (acceptance)', function (this: Mocha.Suite) {
  this.timeout(5000);
  let app: RestApplication;
  let request: Client;

  afterEach(async () => {
    if (app) await app.stop();
    (app as unknown) = undefined;
  });

  context('with default config', () => {
    beforeEach(async () => {
      app = givenRestApplication();
      app.component(ContextExplorerComponent);
      await app.start();
      request = createRestAppClient(app);
    });

    it('exposes API Explorer at "/context-explorer/"', async () => {
      await request
        .get('/context-explorer/')
        .expect(200)
        .expect('content-type', /html/)
        .expect(/<title>LoopBack Context Explorer/);
    });

    it('invokes GET /inspect', async () => {
      const res = await request.get('/context-explorer/inspect').expect(200);
      expect(res.body).to.have.properties('name', 'bindings', 'parent');
    });

    it('invokes GET /inspect?includeParent=false', async () => {
      const res = await request
        .get('/context-explorer/inspect?includeParent=false')
        .expect(200);
      expect(res.body).to.have.properties('name', 'bindings');
      expect(res.body).to.not.have.property('parent');
    });

    it('invokes GET /inspect?includeGraph=true', async () => {
      const res = await request
        .get('/context-explorer/inspect?includeGraph=true')
        .expect(200);
      expect(res.body).to.have.properties(
        'name',
        'bindings',
        'parent',
        'graph',
      );
    });

    it('invokes GET /graph', async function (this: Mocha.Context) {
      if ((process.platform as string) === 'os390') return this.skip();
      const res = await request.get('/context-explorer/graph').expect(200);
      expect(res.get('content-type')).to.match(/^image\/svg\+xml/);
    });

    it('invokes GET /graph?format=dot', async () => {
      const res = await request
        .get('/context-explorer/graph?format=dot')
        .expect(200);
      expect(res.get('content-type')).to.match(/^text\/plain/);
      expect(res.text).to.match(/^digraph "?ContextGraph"? \{/);
    });

    it('invokes GET /dots', async () => {
      const res = await request.get('/context-explorer/dots').expect(200);
      expect(res.get('content-type')).to.match(/^application\/json/);
      expect(res.body).to.be.Array();
      expect(res.body.length).to.eql(3);
      for (const g of res.body) {
        expect(g).to.match(/^digraph "?ContextGraph"? \{/);
      }
    });
  });

  context('with custom ContextExplorerConfig', () => {
    it('honors custom explorer path', async () => {
      await givenAppWithCustomExplorerConfig(undefined, {
        path: '/context-ui',
      });

      await request
        .get('/context-ui/')
        .expect(200, /<title>LoopBack Context Explorer/);

      await request.get('/context-explorer').expect(404);
    });

    it('honors enableSVG = false', async () => {
      await givenAppWithCustomExplorerConfig(undefined, {
        enableSVG: false,
      });

      await request.get('/context-explorer/graph').expect(404);
    });

    it('honors enableD3Animation = false', async () => {
      await givenAppWithCustomExplorerConfig(undefined, {
        enableD3Animation: false,
      });

      await request.get('/context-explorer/dots').expect(404);
      await request.get('/context-explorer').expect(404);
    });

    it('honors enableInspection = false', async () => {
      await givenAppWithCustomExplorerConfig(undefined, {
        enableInspection: false,
      });

      await request.get('/context-explorer/inspect').expect(404);
    });
  });

  function givenRestApplication(config?: RestServerConfig) {
    const rest = Object.assign({}, givenHttpServerConfig(), config);
    return new RestApplication({rest});
  }

  async function givenAppWithCustomExplorerConfig(
    config?: RestServerConfig,
    explorerConfig?: ContextExplorerConfig,
  ) {
    app = givenRestApplication(config);
    if (explorerConfig) {
      app.configure(ContextExplorerBindings.COMPONENT).to(explorerConfig);
    }
    app.component(ContextExplorerComponent);
    await app.start();
    request = createRestAppClient(app);
  }
});
