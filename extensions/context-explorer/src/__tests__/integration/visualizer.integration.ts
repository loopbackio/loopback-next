// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/context-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {ContextGraph} from '../..';
import {renderGraph} from '../../visualizer';

describe('Visualizer', () => {
  let app: Context;
  let server: Context;

  beforeEach(givenContexts);

  it('creates a dot graph with bindings', async function (this: Mocha.Context) {
    if ((process.platform as string) === 'os390') return this.skip();
    server.bind('port').to(3000);
    app.bind('now').toDynamicValue(() => new Date());
    const json = server.inspect();
    const graph = new ContextGraph(json);
    const dot = graph.render();
    const svg = await renderGraph(dot, {engine: 'fdp', format: 'svg'});
    expect(svg).to.match(/^<\?xml/);
    expect(svg).to.match(/<svg /);
  });

  function givenContexts() {
    app = new Context('app');
    server = new Context(app, 'server');
  }
});
