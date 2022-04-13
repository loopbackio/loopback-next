// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {inspect} from 'util';
import {RestBindings} from '../keys';
import {RestRouterOptions} from './rest-router';
import {createResolvedRoute, ResolvedRoute, RouteEntry} from './route-entry';
import {BaseRouter} from './router-base';
import {Trie} from './trie';

const debug = require('debug')('loopback:rest:router:trie');

/**
 * Router implementation based on trie
 */
export class TrieRouter extends BaseRouter {
  private trie = new Trie<RouteEntry>();

  constructor(
    @inject(RestBindings.ROUTER_OPTIONS, {optional: true})
    options?: RestRouterOptions,
  ) {
    super(options);
  }

  protected addRouteWithPathVars(route: RouteEntry) {
    // Add the route to the trie
    const key = this.getKeyForRoute(route);
    this.trie.create(key, route);
  }

  protected findRouteWithPathVars(
    verb: string,
    path: string,
  ): ResolvedRoute | undefined {
    const key = this.getKey(verb, path);

    const found = this.trie.match(key);
    debug('Route matched: %j', found);

    if (found) {
      const route = found.node.value!;
      if (route) {
        debug('Route found: %s', inspect(route, {depth: 5}));
        return createResolvedRoute(route, found.params ?? {});
      }
    }
    return undefined;
  }

  protected listRoutesWithPathVars() {
    return this.trie.list().map(n => n.value);
  }
}
