// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/context-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {config, Constructor, Context, inject, JSONObject} from '@loopback/core';
import {
  api,
  get,
  HttpErrors,
  param,
  RequestContext,
  Response,
  RestBindings,
} from '@loopback/rest';
import {ContextGraph} from './context-graph';
import {ContextExplorerBindings} from './keys';
import {ContextExplorerConfig} from './types';
import {renderGraph} from './visualizer';

export function contextExplorerControllerFactory(
  basePath = '/context-explorer',
): Constructor<unknown> {
  @api({basePath, paths: {}})
  class ContextExplorerController {
    constructor(
      @config({fromBinding: ContextExplorerBindings.COMPONENT})
      private explorerConfig: ContextExplorerConfig = {
        path: '/context-explorer',
      },
      @inject(RestBindings.Http.CONTEXT) private ctx: RequestContext,
    ) {}

    // Map to `GET /inspect`
    @get('/inspect', {
      'x-visibility': 'undocumented',
      responses: {},
    })
    inspect(
      @param.query.boolean('includeInjections') includeInjections = true,
      @param.query.boolean('includeParent') includeParent = true,
      @param.query.boolean('includeGraph') includeGraph = true,
    ): JSONObject {
      if (this.explorerConfig.enableInspection === false) {
        throw new HttpErrors.NotFound();
      }
      const result = this.ctx.inspect({includeInjections, includeParent});
      if (includeGraph) {
        const graph = new ContextGraph(result).render();
        result.graph = graph;
      }
      return result;
    }

    // Map to `GET /inspect`
    @get('/graph', {'x-visibility': 'undocumented', responses: {}})
    async graph(
      @param.query.boolean('includeInjections') includeInjections = true,
      @param.query.boolean('includeParent') includeParent = true,
      @param.query.string('format') format = 'svg',
    ): Promise<Response> {
      if (this.explorerConfig.enableSVG === false) {
        throw new HttpErrors.NotFound();
      }
      const result = this.ctx.inspect({includeInjections, includeParent});
      const graph = new ContextGraph(result).render();

      if (format === 'dot') {
        this.ctx.response.contentType('text/plain').send(graph);
      } else {
        const svg = await renderGraph(graph);
        this.ctx.response.contentType('image/svg+xml').send(svg);
      }
      return this.ctx.response;
    }

    /**
     * Create an array of graphviz dot graphs for d3 animation
     */
    @get('/dots', {
      'x-visibility': 'undocumented',
      responses: {},
    })
    async dots() {
      if (this.explorerConfig.enableD3Animation === false) {
        throw new HttpErrors.NotFound();
      }
      let ctx: Context | undefined = this.ctx;
      const dots: string[] = [];
      while (ctx != null) {
        // Add one graph with injections
        const ctxData = ctx.inspect({
          includeParent: true,
          includeInjections: true,
        });
        const graph = new ContextGraph(ctxData).render();
        dots.push(graph);
        ctx = ctx.parent;
      }
      // Show app, app+server, and app+server+request
      return dots.reverse();
    }
  }

  return ContextExplorerController;
}
