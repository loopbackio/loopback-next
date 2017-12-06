// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Reflector,
  ClassDecoratorFactory,
  PropertyDecoratorFactory,
} from '@loopback/context';
import {ModelDefinition, ModelDefinitionSyntax} from '../model';
import {PropertyDefinition} from '../index';

export const MODEL_KEY = 'loopback:model';
export const MODEL_PROPERTIES_KEY = 'loopback:model-properties';

type PropertyMap = {[name: string]: PropertyDefinition};

// tslint:disable:no-any

/**
 * Decorator for model definitions
 * @param definition
 * @returns {(target:any)}
 */
export function model(definition?: ModelDefinitionSyntax) {
  return function(target: Function & {definition?: ModelDefinition}) {
    if (!definition) {
      definition = {name: target.name};
    }

    const decorator = ClassDecoratorFactory.createDecorator(
      MODEL_KEY,
      definition,
    );

    decorator(target);

    // Build "ModelDefinition" and store it on model constructor
    const modelDef = new ModelDefinition(definition);

    const propertyMap: PropertyMap = Reflector.getMetadata(
      MODEL_PROPERTIES_KEY,
      target.prototype,
    );

    for (const p in propertyMap) {
      modelDef.addProperty(p, propertyMap[p]);
    }

    target.definition = modelDef;
  };
}

/**
 * Decorator for model properties
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function property(definition: PropertyDefinition) {
  return PropertyDecoratorFactory.createDecorator(
    MODEL_PROPERTIES_KEY,
    definition,
  );
}
