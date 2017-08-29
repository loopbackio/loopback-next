// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Class} from '../common-types';
import {Reflector} from '@loopback/context';
import {ModelDefinition, PropertyType, ModelDefinitionSyntax} from '../model';
import {PropertyDefinition} from '../index';

export const MODEL_KEY = 'loopback:model';
export const PROPERTY_KEY = 'loopback:property';
export const MODEL_PROPERTIES_KEY = 'loopback:model-properties';

type PropertyMap = {[name: string]: PropertyDefinition};

// tslint:disable:no-any

/**
 * Decorator for model definitions
 * @param definition
 * @returns {(target:any)}
 */
export function model(definition?: ModelDefinitionSyntax) {
  return function(target: any) {
    if (!definition) {
      definition = {name: target.name};
    }

    // Apply model definition to the model class
    Reflector.defineMetadata(MODEL_KEY, definition, target);

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
  return function(target: any, key: string) {
    // Apply model definition to the model class
    Reflector.defineMetadata(PROPERTY_KEY, definition, target, key);

    // Because there is no way how to iterate decorated properties at runtime,
    // we need to keep an explicit map of decorated properties
    let map: PropertyMap = Reflector.getMetadata(MODEL_PROPERTIES_KEY, target);
    if (!map) {
      map = Object.create(null);
      Reflector.defineMetadata(MODEL_PROPERTIES_KEY, map, target);
    }

    map[key] = definition;
  };
}
