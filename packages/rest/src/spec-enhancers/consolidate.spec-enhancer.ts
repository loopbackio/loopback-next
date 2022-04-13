// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ApplicationConfig,
  BindingScope,
  CoreBindings,
  inject,
  injectable,
} from '@loopback/core';
import {
  asSpecEnhancer,
  ISpecificationExtension,
  isSchemaObject,
  OASEnhancer,
  OpenApiSpec,
  ReferenceObject,
  SchemaObject,
} from '@loopback/openapi-v3';
import debugFactory from 'debug';
import compare from 'json-schema-compare';
import _ from 'lodash';

const debug = debugFactory('loopback:openapi:spec-enhancer:consolidate');

/**
 * This enhancer consolidates schemas into `/components/schemas` and replaces
 * instances of said schema with a $ref pointer.
 *
 * Please note that the title property must be set on a schema in order to be
 * considered for consolidation.
 *
 * For example, with the following schema instance:
 *
 * ```json
 * schema: {
 *   title: 'loopback.example',
 *   properties: {
 *     test: {
 *       type: 'string',
 *     },
 *   },
 * }
 * ```
 *
 * The consolidator will copy the schema body to
 * `/components/schemas/loopback.example` and replace any instance of the schema
 * with a reference to the component schema as follows:
 *
 * ```json
 * schema: {
 *   $ref: '#/components/schemas/loopback.example',
 * }
 * ```
 *
 * When comparing schemas to avoid naming collisions, the description field
 * is ignored.
 */
@injectable(asSpecEnhancer, {scope: BindingScope.SINGLETON})
export class ConsolidationEnhancer implements OASEnhancer {
  name = 'consolidate';
  disabled: boolean;

  constructor(
    @inject(CoreBindings.APPLICATION_CONFIG, {optional: true})
    readonly config?: ApplicationConfig,
  ) {
    this.disabled = this.config?.rest?.openApiSpec?.consolidate === false;
  }

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    return !this.disabled ? this.consolidateSchemaObjects(spec) : spec;
  }

  /**
   * Recursively search OpenApiSpec PathsObject for SchemaObjects with title
   * property. Moves reusable schema bodies to #/components/schemas and replace
   * with json pointer. It handles title collisions with schema body comparision.
   */
  private consolidateSchemaObjects(spec: OpenApiSpec): OpenApiSpec {
    // use 'paths' as crawl root
    this.recursiveWalk(spec.paths, ['paths'], spec);

    return spec;
  }

  private recursiveWalk(
    rootSchema: ISpecificationExtension,
    parentPath: Array<string>,
    spec: OpenApiSpec,
  ) {
    if (this.isTraversable(rootSchema)) {
      Object.entries(rootSchema).forEach(([key, subSchema]) => {
        if (subSchema) {
          this.recursiveWalk(subSchema, parentPath.concat(key), spec);
          this.processSchema(subSchema, parentPath.concat(key), spec);
        }
      });
    }
  }

  /**
   * Carry out schema consolidation after tree traversal. If 'title' property
   * set then we consider current schema for consolidation. SchemaObjects with
   * properties (and title set) are moved to #/components/schemas/<title> and
   * replaced with ReferenceObject.
   *
   * Features:
   *  - name collision protection
   *
   * @param schema - current schema element to process
   * @param parentPath - path object to parent
   * @param spec - subject OpenApi specification
   */
  private processSchema(
    schema: SchemaObject | ReferenceObject,
    parentPath: Array<string>,
    spec: OpenApiSpec,
  ) {
    const schemaObj = this.ifConsolidationCandidate(schema);
    if (schemaObj) {
      // name collison protection
      let instanceNo = 1;
      let title = schemaObj.title!;
      let refSchema = this.getRefSchema(title, spec);
      while (
        refSchema &&
        !compare(schemaObj as ISpecificationExtension, refSchema, {
          ignore: ['description'],
        })
      ) {
        title = `${schemaObj.title}${instanceNo++}`;
        refSchema = this.getRefSchema(title, spec);
      }
      if (!refSchema) {
        debug('Creating new component $ref with schema %j', schema);
        this.patchRef(title, schema, spec);
      }
      debug('Creating link to $ref %j', title);
      this.patchPath(title, parentPath, spec);
    }
  }

  private getRefSchema(
    name: string,
    spec: OpenApiSpec,
  ): ISpecificationExtension | undefined {
    const schema = _.get(spec, ['components', 'schemas', name]);

    return schema;
  }

  private patchRef(
    name: string,
    value: ISpecificationExtension,
    spec: OpenApiSpec,
  ) {
    _.set(spec, ['components', 'schemas', name], value);
  }

  private patchPath(name: string, path: Array<string>, spec: OpenApiSpec) {
    const patch = {
      $ref: `#/components/schemas/${name}`,
    };
    _.set(spec, path, patch);
  }

  private ifConsolidationCandidate(
    schema: SchemaObject | ReferenceObject,
  ): SchemaObject | undefined {
    // use title to discriminate references
    return isSchemaObject(schema) && schema.properties && schema.title
      ? schema
      : undefined;
  }

  private isTraversable(schema: ISpecificationExtension): boolean {
    return schema && typeof schema === 'object' ? true : false;
  }
}
