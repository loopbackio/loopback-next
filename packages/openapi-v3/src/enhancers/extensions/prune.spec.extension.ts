import {bind} from '@loopback/core';
import _ from 'lodash';
import {ISpecificationExtension, OpenApiSpec} from '../..';
import {asSpecEnhancer, OASEnhancer} from '../types';

/**
 * A spec enhancer to remove unneccesary properties from the OpenAPI spec
 *
 */
@bind(asSpecEnhancer)
export class PruneSpecEnhancer implements OASEnhancer {
  name = 'prune';

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    try {
      // note, title is valid but pruning as not needed atm
      const values = ['x-', 'title'];
      return this.pruneSchemas({spec, values});
    } catch {
      console.log('Prune Enhancer failed, returned original spec.');
      return spec;
    }
  }

  /**
   *  Recursively walk OpenApiSpec and prune excess properties
   *
   */
  private pruneSchemas(ctx: PruneContext): OpenApiSpec {
    // use 'paths' as crawl root
    this.recursiveWalk(ctx.spec.paths, ['paths'], ctx);
    // use 'components.schemas' as crawl root
    if (ctx.spec.components && ctx.spec.components.schemas) {
      this.recursiveWalk(
        ctx.spec.components.schemas,
        ['components', 'schemas'],
        ctx,
      );
    }

    return ctx.spec;
  }

  private recursiveWalk(
    rootSchema: ISpecificationExtension,
    parentPath: Array<string>,
    ctx: PruneContext,
  ) {
    if (this.isTraversable(rootSchema)) {
      Object.entries(rootSchema).forEach(([key, subSchema]) => {
        if (subSchema) {
          this.recursiveWalk(subSchema, parentPath.concat(key), ctx);
          if (!this.isTraversable(subSchema)) {
            this.processSchema(rootSchema, parentPath, ctx);
          }
        }
      });
    }
  }

  /**
   * Carry out schema pruning after tree traversal. If key starts with any of
   * the propsToRemove then unset.
   *
   * @param schema - current schema element to process
   * @param parentPath - path object to parent
   * @param ctx - prune context object
   *
   */
  private async processSchema(
    schema: ISpecificationExtension,
    parentPath: Array<string>,
    ctx: PruneContext,
  ) {
    Object.keys(schema).forEach(key => {
      ctx.values.forEach(name => {
        if (key.startsWith(name)) {
          this.patchRemove(parentPath.concat(key), ctx);
        }
      });
    });
  }

  patchRemove(path: Array<string>, ctx: PruneContext) {
    _.unset(ctx.spec, path);
  }

  private isTraversable(schema: ISpecificationExtension): boolean {
    return schema && typeof schema === 'object' ? true : false;
  }
}

/**
 * Prune context
 *
 * @param spec - subject openapi specification
 * @param values - array of properties to remove
 *
 */
interface PruneContext {
  spec: OpenApiSpec;
  values: Array<string>;
}
