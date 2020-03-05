// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest-crud
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  BindingSelector,
  Constructor,
  ControllerClass,
  inject,
} from '@loopback/core';
import {
  asModelApiBuilder,
  ModelApiBuilder,
  ModelApiConfig,
} from '@loopback/model-api-builder';
import {
  ApplicationWithRepositories,
  Class,
  defineEntityCrudRepositoryClass,
  Entity,
  EntityCrudRepository,
} from '@loopback/repository';
import {Model} from '@loopback/rest';
import debugFactory from 'debug';
import {defineCrudRestController} from '.';

const debug = debugFactory('loopback:boot:crud-rest');

export interface ModelCrudRestApiConfig extends ModelApiConfig {
  // E.g. '/products'
  basePath: string;
}

@bind(asModelApiBuilder)
export class CrudRestApiBuilder implements ModelApiBuilder {
  readonly pattern: string = 'CrudRest';

  build(
    application: ApplicationWithRepositories,
    modelClass: typeof Model & {prototype: Model},
    cfg: ModelApiConfig,
  ): Promise<void> {
    const modelName = modelClass.name;
    const config = cfg as ModelCrudRestApiConfig;
    if (!config.basePath) {
      throw new Error(
        `Missing required field "basePath" in configuration for model ${modelName}.`,
      );
    }

    if (!(modelClass.prototype instanceof Entity)) {
      throw new Error(
        `CrudRestController requires a model that extends 'Entity'. (Model name ${modelName} does not extend 'Entity')`,
      );
    }
    const entityClass = modelClass as typeof Entity & {prototype: Entity};

    let repoBindingName = `repositories.${entityClass.name}Repository`;

    if (application.isBound(repoBindingName)) {
      debug('Using the existing Repository binding %j', repoBindingName);
    } else {
      // repository class does not exist
      const repositoryClass = setupCrudRepository(entityClass, config);
      application.repository(repositoryClass);
      repoBindingName = repositoryClass.name;
      debug('Registered repository class', repoBindingName);
    }

    const controllerClass = setupCrudRestController(entityClass, config);
    application.controller(controllerClass);
    debug('Registered controller class', controllerClass.name);

    return Promise.resolve();
  }
}

/**
 * Set up a CRUD Repository class for the given Entity class.
 *
 * @param entityClass - the Entity class the repository is built for
 * @param config - configuration of the Entity class
 */
function setupCrudRepository(
  entityClass: typeof Entity & {prototype: Entity},
  config: ModelCrudRestApiConfig,
): Class<EntityCrudRepository<Entity, unknown>> {
  const repositoryClass = defineEntityCrudRepositoryClass(entityClass);

  injectFirstConstructorArg(
    repositoryClass,
    `datasources.${config.dataSource}`,
  );

  return repositoryClass;
}

/**
 * Set up a CRUD Controller class for the given Entity class.
 *
 * @param entityClass - the Entity class the controller is built for
 * @param config - configuration of the Entity class
 */
function setupCrudRestController(
  entityClass: typeof Entity & {prototype: Entity},
  config: ModelCrudRestApiConfig,
): ControllerClass {
  const controllerClass = defineCrudRestController(
    entityClass,
    // important - forward the entire config object to allow controller
    // factories to accept additional (custom) config options
    config,
  );

  injectFirstConstructorArg(
    controllerClass,
    `repositories.${entityClass.name}Repository`,
  );

  return controllerClass;
}

/**
 * Inject given key into a given class constructor
 *
 * @param ctor - constructor for a class (e.g. a controller class)
 * @param key - binding to use in order to resolve the value of the decorated
 * constructor parameter or property
 */
function injectFirstConstructorArg<T>(
  ctor: Constructor<T>,
  key: BindingSelector,
) {
  inject(key)(
    ctor,
    undefined, // constructor member
    0, // the first argument
  );
}
