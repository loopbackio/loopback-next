// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {OpenApiSpec} from '@loopback/openapi-v3-types';

export type RouterSpec = Pick<OpenApiSpec, 'paths' | 'components' | 'tags'>;

export function assignRouterSpec(target: RouterSpec, additions: RouterSpec) {
  if (additions.components && additions.components.schemas) {
    if (!target.components) target.components = {};
    if (!target.components.schemas) target.components.schemas = {};
    Object.assign(target.components.schemas, additions.components.schemas);
  }

  for (const url in additions.paths) {
    if (!(url in target.paths)) target.paths[url] = {};
    for (const verbOrKey in additions.paths[url]) {
      // routes registered earlier takes precedence
      if (verbOrKey in target.paths[url]) continue;
      target.paths[url][verbOrKey] = additions.paths[url][verbOrKey];
    }
  }

  if (additions.tags && additions.tags.length > 0) {
    if (!target.tags) target.tags = [];
    for (const tag of additions.tags) {
      // tags defined earlier take precedence
      if (target.tags.some(t => t.name === tag.name)) continue;
      target.tags.push(tag);
    }
  }
}
