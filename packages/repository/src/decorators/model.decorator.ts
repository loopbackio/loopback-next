// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ClassDecoratorFactory,
  MetadataAccessor,
  MetadataInspector,
  MetadataMap,
  PropertyDecoratorFactory,
} from '@loopback/context';
import {
  ModelDefinition,
  ModelDefinitionSyntax,
  PropertyDefinition,
  PropertyType,
  RelationDefinitionMap,
} from '../model';
import {RELATIONS_KEY} from '../relations/relation.decorator';

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
    buildModelDefinition(target, def);
  };
}

/**
 * Build model definition from decorations
 * @param target Target model class
 * @param def Model definition spec
 */
export function buildModelDefinition(
  target: Function & {definition?: ModelDefinition | undefined},
  def?: ModelDefinitionSyntax,
) {
  // Check if the definition for this class has been built (not from the super
  // class)
  const baseClass = Object.getPrototypeOf(target);
  if (
    !def &&
    target.definition &&
    baseClass &&
    target.definition !== baseClass.definition
  ) {
    return target.definition;
  }
  const modelDef = new ModelDefinition(def || {name: target.name});
  const prototype = target.prototype;
  const propertyMap: PropertyMap =
    MetadataInspector.getAllPropertyMetadata(MODEL_PROPERTIES_KEY, prototype) ||
    {};
  for (const p in propertyMap) {
    const propertyDef = propertyMap[p];
    const designType = MetadataInspector.getDesignTypeForProperty(prototype, p);
    if (!propertyDef.type) {
      propertyDef.type = designType;
    }
    modelDef.addProperty(p, propertyDef);
  }
  target.definition = modelDef;
  const relationMeta: RelationDefinitionMap =
    MetadataInspector.getAllPropertyMetadata(RELATIONS_KEY, prototype) || {};
  const relations: RelationDefinitionMap = {};
  // Build an object keyed by relation names
  Object.values(relationMeta).forEach(r => {
    relations[r.name] = r;
  });
  target.definition.relations = relations;
  return modelDef;
}

/**
 * Decorator for model properties
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function property(definition?: Partial<PropertyDefinition>) {
  return PropertyDecoratorFactory.createDecorator(
    MODEL_PROPERTIES_KEY,
    Object.assign({}, definition),
  );
}

export namespace property {
  export const ERR_PROP_NOT_ARRAY =
    '@property.array can only decorate array properties!';
  export const ERR_NO_ARGS = 'decorator received less than two parameters';

  /**
   *
   * @param itemType The type of array items.
   * Examples: `number`, `Product`, `() => Order`.
   * @param definition Optional PropertyDefinition object for additional
   * metadata
   */
  export function array(
    itemType: PropertyType,
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
