// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ClassDecoratorFactory,
  MetadataAccessor,
  MetadataInspector,
  MetadataMap,
  PropertyDecoratorFactory,
} from '@loopback/core';
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

export type PropertyMap = MetadataMap<Partial<PropertyDefinition>>;

/**
 * Decorator for model definitions
 * @param definition
 * @returns A class decorator for `model`
 */
export function model(definition?: Partial<ModelDefinitionSyntax>) {
  return function (target: Function & {definition?: ModelDefinition}) {
    definition = definition ?? {};
    const def: ModelDefinitionSyntax = Object.assign(definition, {
      name: definition.name ?? target.name,
    });
    const decorator = ClassDecoratorFactory.createDecorator(
      MODEL_KEY,
      definition,
      {decoratorName: '@model'},
    );

    decorator(target);

    // Build "ModelDefinition" and store it on model constructor
    buildModelDefinition(target, def);
  };
}

/**
 * Build model definition from decorations
 * @param target - Target model class
 * @param def - Model definition spec
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
  const modelDef = new ModelDefinition(def ?? {name: target.name});
  const prototype = target.prototype;
  const propertyMap: PropertyMap =
    MetadataInspector.getAllPropertyMetadata(MODEL_PROPERTIES_KEY, prototype) ??
    {};
  for (const [propName, propDef] of Object.entries(propertyMap)) {
    const designType =
      propDef.type ??
      MetadataInspector.getDesignTypeForProperty(prototype, propName);
    if (!designType) {
      const err: Error & {code?: string} = new Error(
        `The definition of model property ${modelDef.name}.${propName} is missing ` +
          '`type` field and TypeScript did not provide any design-time type. ' +
          'Learn more at https://loopback.io/doc/en/lb4/Error-codes.html#cannot_infer_property_type',
      );
      err.code = 'CANNOT_INFER_PROPERTY_TYPE';
      throw err;
    }

    if (propDef.hidden) {
      modelDef.settings.hiddenProperties =
        modelDef.settings.hiddenProperties ?? [];
      modelDef.settings.hiddenProperties.push(propName);
    }
    propDef.type = designType;
    modelDef.addProperty(propName, propDef);
  }
  target.definition = modelDef;
  const relationMeta: RelationDefinitionMap =
    MetadataInspector.getAllPropertyMetadata(RELATIONS_KEY, prototype) ?? {};
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
 * @returns A property decorator
 */
export function property(definition?: Partial<PropertyDefinition>) {
  return PropertyDecoratorFactory.createDecorator(
    MODEL_PROPERTIES_KEY,
    Object.assign({}, definition),
    {decoratorName: '@property'},
  );
}

export namespace property {
  export const ERR_PROP_NOT_ARRAY =
    '@property.array can only decorate array properties!';
  export const ERR_NO_ARGS = 'decorator received less than two parameters';

  /**
   *
   * @param itemType - The type of array items.
   * Examples: `number`, `Product`, `() => Order`.
   * @param definition - Optional PropertyDefinition object for additional
   * metadata
   */
  export function array(
    itemType: PropertyType,
    definition?: Partial<PropertyDefinition>,
  ) {
    return function (target: object, propertyName: string) {
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
