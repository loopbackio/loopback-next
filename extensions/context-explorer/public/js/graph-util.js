// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/context-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/* eslint-disable no-undef */
/**
 * Find dependencies of a set of starting nodes, including transitive ones
 * @param graph - Graph object
 * @param startingNodes - A set of nodes as starting ones
 */
function findDependencies(graph, startingNodes) {
  const visited = new Set();
  let nodesToBeAdded = new Set(startingNodes);
  while (nodesToBeAdded.size !== 0) {
    // Try to find nodes that are successors of starting nodes
    const matched = new Set();
    for (const node of nodesToBeAdded) {
      visited.add(node);
      const successors = graph.successors(node);
      for (const s of successors) {
        matched.add(s);
      }
    }
    // Only include nodes found but not visited yet
    nodesToBeAdded = new Set();
    for (const node of matched) {
      if (!visited.has(node)) {
        nodesToBeAdded.add(node);
      }
      visited.add(node);
    }
  }
  return visited;
}

/**
 * Filter the graph with a set of starting nodes and their dependencies
 * @param graph - Graph object
 * @param startingNodes - A set of starting nodes
 */
function filterGraph(graph, startingNodes) {
  const selected = findDependencies(graph, startingNodes);
  const nodesToBeRemoved = graph
    .nodes()
    .filter(n => !selected.has(n) && graph.children(n).length === 0);
  for (const node of nodesToBeRemoved) {
    graph.removeNode(node);
  }
  removeEmptySubgraphs(graph);
}

function removeEmptySubgraphs(graph) {
  // Remove empty subgraphs
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const emptySubgraphs = graph
      .nodes()
      .filter(n => n.startsWith('cluster_') && graph.children(n).length === 0);
    if (emptySubgraphs.length === 0) break;
    for (const node of emptySubgraphs) {
      graph.removeNode(node);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function selectNodes(dotGraph, startingNodes) {
  const graph = graphlibDot.read(normalizeDot(dotGraph));
  filterGraph(graph, startingNodes);
  return graphlibDot.write(graph);
}

function normalizeDot(dotGraph) {
  // graphlib-dot does not support the trailing `,` after the last attribute
  return dotGraph.replace(/,(\s+\];)/gm, '$1');
}
