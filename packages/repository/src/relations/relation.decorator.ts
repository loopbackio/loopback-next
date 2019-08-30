// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {PropertyDecoratorFactory} from '@loopback/context';
import {buildModelDefinition} from '../decorators';
import {Model, RelationDefinitionMap} from '../model';
import {RelationType} from './relation.types';

export const RELATIONS_KEY = 'loopback:relations';

/**
 * Decorator for relations
 * @param definition
 * @returns A property decorator
 */
export function relation(definition?: Object) {
  // Apply relation definition to the model class
  return PropertyDecoratorFactory.createDecorator(RELATIONS_KEY, definition, {
    decoratorName: '@relation',
  });
}

/**
 * Get metadata of all relations defined on a given model class.
 *
 * @param modelCtor - The model class (the constructor function).
 * @returns A map of relation definitions
 */
export function getModelRelations(
  modelCtor: typeof Model,
): RelationDefinitionMap {
  // Build model definitions if `@model` is missing
  const modelDef = buildModelDefinition(modelCtor);
  return (modelDef && modelDef.relations) || {};
}

//
// placeholder decorators for relations that are not implemented yet
// TODO: move these decorators to per-relation subdirectories
//

/**
 * Decorator for embedsOne
 * @param definition
 * @returns A property decorator
 */
export function embedsOne(definition?: Object) {
  const rel = Object.assign({type: RelationType.embedsOne}, definition);
  return PropertyDecoratorFactory.createDecorator(RELATIONS_KEY, rel, {
    decoratorName: '@embedsOne',
  });
}

/**
 * Decorator for embedsMany
 * @param definition
 * @returns A property decorator
 */
export function embedsMany(definition?: Object) {
  const rel = Object.assign({type: RelationType.embedsMany}, definition);
  return PropertyDecoratorFactory.createDecorator(RELATIONS_KEY, rel, {
    decoratorName: '@embedsMany',
  });
}

/**
 * Decorator for referencesOne
 * @param definition
 * @returns A property decorator
 */
export function referencesOne(definition?: Object) {
  const rel = Object.assign({type: RelationType.referencesOne}, definition);
  return PropertyDecoratorFactory.createDecorator(RELATIONS_KEY, rel, {
    decoratorName: '@referencesOne',
  });
}

/**
 * Decorator for referencesMany
 * @param definition
 * @returns A property decorator
 */
export function referencesMany(definition?: Object) {
  const rel = Object.assign({type: RelationType.referencesMany}, definition);
  return PropertyDecoratorFactory.createDecorator(RELATIONS_KEY, rel, {
    decoratorName: '@referencesMany',
  });
}
