import {bind} from '@loopback/core';
import compare from 'json-schema-compare';
import _ from 'lodash';
import {
  ISpecificationExtension,
  isSchemaObject,
  OpenApiSpec,
  ReferenceObject,
  SchemaObject,
} from '../types';
import {asSpecEnhancer, OASEnhancer} from './types';

/**
 * A spec enhancer to consolidate OpenAPI specs
 *
 */
@bind(asSpecEnhancer)
export class ConsolidationEnhancer implements OASEnhancer {
  name = 'consolidate';

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    return this.consolidateSchemaObjects(spec);
  }

  /**
   *  Recursively search OpenApiSpec PathsObject for SchemaObjects with title property.
   *  Move reusable schema bodies to #/components/schemas and replace with json pointer.
   *  Handles title collisions with schema body comparision.
   *
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
   *
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
        this.patchRef(title, schema, spec);
      }
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
