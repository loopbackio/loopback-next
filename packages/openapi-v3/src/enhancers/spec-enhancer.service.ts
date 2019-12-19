// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {config, extensionPoint, extensions, Getter} from '@loopback/core';
import debugModule from 'debug';
import * as _ from 'lodash';
import {inspect} from 'util';
import {OpenApiSpec} from '../types';
import {OASEnhancer, OAS_ENHANCER_EXTENSION_POINT_NAME} from './types';
const jsonmergepatch = require('json-merge-patch');

const debug = debugModule('loopback:openapi:spec-enhancer');

/**
 * Options for the OpenAPI Spec enhancer extension point
 */
export interface OASEnhancerServiceOptions {
  // no-op
}

/**
 * An extension point for OpenAPI Spec enhancement
 * This service is used for enhancing an OpenAPI spec by loading and applying one or more
 * registered enhancers.
 *
 * A typical use of it would be generating the OpenAPI spec for the endpoints on a server
 * in the `@loopback/rest` module.
 */
@extensionPoint(OAS_ENHANCER_EXTENSION_POINT_NAME)
export class OASEnhancerService {
  constructor(
    /**
     * Inject a getter function to fetch spec enhancers
     */
    @extensions()
    private getEnhancers: Getter<OASEnhancer[]>,
    /**
     * An extension point should be able to receive its options via dependency
     * injection.
     */
    @config()
    public readonly options?: OASEnhancerServiceOptions,
  ) {}

  private _spec: OpenApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'LoopBack Application',
      version: '1.0.0',
    },
    paths: {},
  };

  /**
   * Getter for `_spec`
   */
  get spec(): OpenApiSpec {
    return this._spec;
  }
  /**
   * Setter for `_spec`
   */
  set spec(value: OpenApiSpec) {
    this._spec = value;
  }

  /**
   * Find an enhancer by its name
   * @param name The name of the enhancer you want to find
   */
  async getEnhancerByName(name: string): Promise<OASEnhancer | undefined> {
    // Get the latest list of enhancers
    const enhancers = await this.getEnhancers();
    return enhancers.find(e => e.name === name);
  }

  /**
   * Apply a given enhancer's merge function. Return the latest _spec.
   * @param name The name of the enhancer you want to apply
   */
  async applyEnhancerByName(name: string): Promise<OpenApiSpec> {
    const enhancer = await this.getEnhancerByName(name);
    if (enhancer) this._spec = enhancer.modifySpec(this._spec);
    return this._spec;
  }

  /**
   * Generate OpenAPI spec by applying ALL registered enhancers
   * TBD: load enhancers by group names
   */
  async applyAllEnhancers(options = {}): Promise<OpenApiSpec> {
    const enhancers = await this.getEnhancers();
    if (_.isEmpty(enhancers)) return this._spec;
    for (const e of enhancers) {
      this._spec = e.modifySpec(this._spec);
    }
    debug(`Spec enhancer service, generated spec: ${inspect(this._spec)}`);
    return this._spec;
  }
}

/**
 * The default merge function to patch the current OpenAPI spec.
 * It leverages module `json-merge-patch`'s merge API to merge two json objects.
 * It returns a new merged object without modifying the original one.
 *
 * A list of merging rules can be found in test file:
 * https://github.com/pierreinglebert/json-merge-patch/blob/master/test/lib/merge.js
 *
 * @param currentSpec The original spec
 * @param patchSpec The patch spec to be merged into the original spec
 */
export function mergeOpenAPISpec(
  currentSpec: Partial<OpenApiSpec>,
  patchSpec: Partial<OpenApiSpec>,
) {
  const mergedSpec = jsonmergepatch.merge(currentSpec, patchSpec);
  return mergedSpec;
}
