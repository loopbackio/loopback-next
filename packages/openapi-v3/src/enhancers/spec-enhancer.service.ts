// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {config, extensionPoint, extensions, Getter} from '@loopback/core';
import debugModule from 'debug';
import * as _ from 'lodash';
import {inspect} from 'util';
import {
  DEFAULT_OPENAPI_SPEC_INFO,
  OpenApiSpec,
  SecuritySchemeObject,
} from '../types';
import {OASEnhancerBindings} from './keys';
import {OASEnhancer} from './types';
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
@extensionPoint(OASEnhancerBindings.OAS_ENHANCER_EXTENSION_POINT_NAME)
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
      ...DEFAULT_OPENAPI_SPEC_INFO,
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
  async getEnhancerByName<T extends OASEnhancer = OASEnhancer>(
    name: string,
  ): Promise<T | undefined> {
    // Get the latest list of enhancers
    const enhancers = await this.getEnhancers();
    return enhancers.find(e => e.name === name) as T | undefined;
  }

  /**
   * Apply a given enhancer's merge function. Return the latest _spec.
   * @param name The name of the enhancer you want to apply
   */
  async applyEnhancerByName(name: string): Promise<OpenApiSpec> {
    const enhancer = await this.getEnhancerByName(name);
    if (enhancer) this._spec = await enhancer.modifySpec(this._spec);
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
      this._spec = await e.modifySpec(this._spec);
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
 * @returns A new specification object created by merging the original ones.
 */
export function mergeOpenAPISpec<
  C extends Partial<OpenApiSpec>,
  P extends Partial<OpenApiSpec>,
>(currentSpec: C, patchSpec: P): C & P {
  const mergedSpec = jsonmergepatch.merge(currentSpec, patchSpec);
  return mergedSpec;
}

/**
 * Security scheme merge helper function to patch the current OpenAPI spec.
 * It provides a direct route to add a security schema to the specs components.
 * It returns a new merged object without modifying the original one.
 *
 * @param currentSpec The original spec
 * @param schemeName The name of the security scheme to be added
 * @param schemeSpec The security scheme spec body to be added,
 */
export function mergeSecuritySchemeToSpec(
  spec: OpenApiSpec,
  schemeName: string,
  schemeSpec: SecuritySchemeObject,
): OpenApiSpec {
  const patchSpec = {
    components: {
      securitySchemes: {[schemeName]: schemeSpec},
    },
  };

  const mergedSpec = mergeOpenAPISpec(spec, patchSpec);
  return mergedSpec;
}
