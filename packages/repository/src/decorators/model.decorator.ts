// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  MetadataInspector,
  ClassDecoratorFactory,
  PropertyDecoratorFactory,
  MetadataMap,
  MetadataAccessor,
} from '@loopback/context';
import {
  ModelDefinition,
  ModelDefinitionSyntax,
  PropertyDefinition,
  ModelResolver,
} from '../model';
import {RELATIONS_KEY, RelationDefinitionBase} from './relation.decorator';

export const MODEL_KEY = MetadataAccessor.create<
  Partial<ModelDefinitionSyntax>,
  ClassDecorator
>('loopback:model');
export const MODEL_PROPERTIES_KEY = MetadataAccessor.create<
  PropertyDefinition,
  PropertyDecorator
>('loopback:model-properties');
export const MODEL_WITH_PROPERTIES_KEY = MetadataAccessor.create<
  ModelDefinition,
  ClassDecorator
>('loopback:model-and-properties');

export type PropertyMap = MetadataMap<PropertyDefinition>;
export type RelationMap = MetadataMap<RelationDefinitionBase>;

// tslint:disable:no-any

/**
 * Decorator for model definitions
 * @param definition
 * @returns {(target:any)}
 */
export function model(definition?: Partial<ModelDefinitionSyntax>) {
  return function(target: Function & {definition?: ModelDefinition}) {
    definition = definition || {};
    const def: ModelDefinitionSyntax = Object.assign(definition, {
      name: definition.name || target.name,
    });
    const decorator = ClassDecoratorFactory.createDecorator(
      MODEL_KEY,
      definition,
    );

    decorator(target);

    // Build "ModelDefinition" and store it on model constructor
    const modelDef = new ModelDefinition(def);

    const propertyMap: PropertyMap =
      MetadataInspector.getAllPropertyMetadata(
        MODEL_PROPERTIES_KEY,
        target.prototype,
      ) || {};

    for (const p in propertyMap) {
      const propertyDef = propertyMap[p];
      const designType = MetadataInspector.getDesignTypeForProperty(
        target.prototype,
        p,
      );
      if (!propertyDef.type) {
        propertyDef.type = designType;
      }
      modelDef.addProperty(p, propertyDef);
    }

    target.definition = modelDef;

    const relationMap: RelationMap =
      MetadataInspector.getAllPropertyMetadata(
        RELATIONS_KEY,
        target.prototype,
      ) || {};
    target.definition.relations = relationMap;
  };
}

/**
 * Decorator for model properties
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function property(definition?: Partial<PropertyDefinition>) {
  if (
    definition &&
    (definition.type === Array || definition.type === 'array') &&
    (definition as object).hasOwnProperty('itemType') &&
    !definition.itemType
  ) {
    // this path is taken when cyclic dependency is detected
    // in that case, a ModelResolver should be used instead
    throw new Error('target model is undefined');
  }
  return PropertyDecoratorFactory.createDecorator(
    MODEL_PROPERTIES_KEY,
    Object.assign({}, definition),
  );
}

export namespace property {
  export const ERR_PROP_NOT_ARRAY =
    '@property.array can only decorate array properties!';

  /**
   *
   * @param itemType The class of the array to decorate
   * @param definition Optional PropertyDefinition object for additional
   * metadata
   */
  export function array<T>(
    itemType: T | ModelResolver<T>,
    definition?: Partial<PropertyDefinition>,
  ) {
    return function(target: Object, propertyName: string) {
      const propType = MetadataInspector.getDesignTypeForProperty(
        target,
        propertyName,
      );
      if (propType !== Array) {
        throw new Error(ERR_PROP_NOT_ARRAY);
      } else {
        property(
          Object.assign(
            {type: Array, itemType} as Partial<PropertyDefinition>,
            definition,
          ),
        )(target, propertyName);
      }
    };
  }
}
