// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest-crud
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, ControllerClass, inject} from '@loopback/core';
import {
  asModelApiBuilder,
  ModelApiBuilder,
  ModelApiConfig,
} from '@loopback/model-api-builder';
import {
  ApplicationWithRepositories,
  Class,
  Entity,
  EntityCrudRepository,
  Model,
} from '@loopback/repository';
import * as debugFactory from 'debug';
import {defineCrudRestController} from './crud-rest.controller';
import {defineRepositoryClass} from './repository-builder';

const debug = debugFactory('loopback:boot:crud-rest');

@bind(asModelApiBuilder)
export class CrudRestApiBuilder implements ModelApiBuilder {
  readonly pattern: string = 'CrudRest';

  setup(
    application: ApplicationWithRepositories,
    modelClass: typeof Model & {prototype: Model},
    config: ModelApiConfig,
  ): Promise<void> {
    if (!(modelClass.prototype instanceof Entity)) {
      throw new Error(
        `CrudRestController requires an Entity, Models are not supported. (Model name: ${modelClass.name})`,
      );
    }
    const entityClass = modelClass as typeof Entity & {prototype: Entity};

    // TODO Check if the repository class has been already defined.
    // If yes, then skip creation of the default repository
    const repositoryClass = setupCrudRepository(entityClass, config);
    application.repository(repositoryClass);
    debug('Registered repository class', repositoryClass.name);

    const controllerClass = setupCrudRestController(entityClass, config);
    application.controller(controllerClass);
    debug('Registered controller class', controllerClass.name);

    return Promise.resolve();
  }
}

function setupCrudRepository(
  entityClass: typeof Entity & {prototype: Entity},
  modelConfig: ModelApiConfig,
): Class<EntityCrudRepository<Entity, unknown>> {
  const repositoryClass = defineRepositoryClass(entityClass);

  inject(`datasources.${modelConfig.dataSource}`)(
    repositoryClass,
    undefined,
    0,
  );

  return repositoryClass;
}

function setupCrudRestController(
  entityClass: typeof Entity & {prototype: Entity},
  modelConfig: ModelApiConfig,
): ControllerClass {
  const controllerClass = defineCrudRestController(
    entityClass,
    // important - forward the entire config object to allow controller
    // factories to accept additional (custom) config options
    modelConfig,
  );

  inject(`repositories.${entityClass.name}Repository`)(
    controllerClass,
    undefined,
    0,
  );

  return controllerClass;
}
