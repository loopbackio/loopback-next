// Copyright IBM Corp. 2017, 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RouteEntry, createResolvedRoute} from './route-entry';
import {Trie} from './trie';
import {Request} from '../types';
import {inspect} from 'util';
import {BaseRouter} from './router-base';

const debug = require('debug')('loopback:rest:router:trie');

/**
 * Router implementation based on trie
 */
export class TrieRouter extends BaseRouter {
  private trie = new Trie<RouteEntry>();

  protected addRouteWithPathVars(route: RouteEntry) {
    // Add the route to the trie
    const key = this.getKeyForRoute(route);
    this.trie.create(key, route);
  }

  protected findRouteWithPathVars(request: Request) {
    const path = this.getKeyForRequest(request);

    const found = this.trie.match(path);
    debug('Route matched: %j', found);

    if (found) {
      const route = found.node.value!;
      if (route) {
        debug('Route found: %s', inspect(route, {depth: 5}));
        return createResolvedRoute(route, found.params || {});
      }
    }
    return undefined;
  }

  protected listRoutesWithPathVars() {
    return this.trie.list().map(n => n.value);
  }
}
