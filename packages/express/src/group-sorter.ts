// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory from 'debug';
import toposort from 'toposort';
const debug = debugFactory('loopback:middleware');
/**
 * Sort the groups by their relative order
 * @param orderedGroups - A list of arrays - each of which represents a partial
 * order of groups.
 */
export function sortListOfGroups(...orderedGroups: string[][]) {
  if (debug.enabled) {
    debug(
      'Dependency graph: %s',
      orderedGroups.map(edge => edge.join('->')).join(', '),
    );
  }
  const graph: [string, string][] = [];
  for (const groups of orderedGroups) {
    if (groups.length >= 2) {
      groups.reduce((prev: string | undefined, group) => {
        if (typeof prev === 'string') {
          graph.push([prev, group]);
        }
        return group;
      }, undefined);
    }
  }
  const sorted = toposort(graph);
  debug('Sorted groups: %s', sorted.join('->'));
  return sorted;
}
