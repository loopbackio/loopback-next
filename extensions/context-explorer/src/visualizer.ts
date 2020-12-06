// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/context-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const Viz = require('viz.js');
// eslint-disable-next-line @typescript-eslint/naming-convention
let vizOptions: {Module: Function; render: Function};

/**
 * Render a graphviz dot string
 * @param graph - A graph in dot format
 * @param options - Options for the rendering
 */
export function renderGraph(
  graph: string,
  options: {engine?: string; format?: string} = {},
): Promise<string> {
  options = {
    engine: 'fdp',
    format: 'svg',
    ...options,
  };

  // Loading `full.render.js` seems to cause crash of `npm test` for
  // `loopback-next` if it happens too early in the module scope
  if (vizOptions == null) {
    // For some reason, the 2nd execution of `require('viz.js/full.render.js')`
    // returns {undefined, undefined}
    const {Module, render} = require('viz.js/full.render.js');
    // Cache the options
    vizOptions = {Module, render};
  }

  const viz = new Viz(vizOptions);
  return viz.renderString(graph, options);
}
