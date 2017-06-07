// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export const jugglerModule = require('loopback-datasource-juggler');

import {MixinBuilder} from './mixin';
import {Class, ObjectType, Options, Any} from './common-types';

import {juggler} from './loopback-datasource-juggler';

export * from './loopback-datasource-juggler';

/* tslint:disable-next-line:variable-name */
export const DataSourceConstructor = jugglerModule.DataSource as typeof juggler.DataSource;
/* tslint:disable-next-line:variable-name */
export const ModelBaseConstructor = jugglerModule.ModelBaseClass as typeof juggler.ModelBase;

/**
 * This is a bridge to the legacy DAO class. The function mixes DAO methods
 * into a model class and attach it to a given data source
 * @param modelClass {} Model class
 * @param ds {DataSource} Data source
 * @returns {} The new model class with DAO (CRUD) operations
 */
export function bindModel<T extends typeof juggler.ModelBase>(modelClass: T,
  ds: juggler.DataSource): T {
  const boundModelClass = class extends modelClass {};
  boundModelClass.attachTo(ds);
  return boundModelClass;
}

import {Entity} from './model';
import {Filter, Where} from './query';
import {EntityCrudRepository} from './repository';

function isPromise<T>(p: Any): p is Promise<T> {
  return p !== null && typeof p === 'object' && typeof p.then === 'function';
}

function ensurePromise<T>(p: juggler.PromiseOrVoid<T>): Promise<T> {
  if (isPromise(p)) {
    return p;
  } else {
    return Promise.reject(new Error('The value should be a Promise: ' + p));
  }
}

export class DefaultCrudRepository<T extends Entity, ID>
implements EntityCrudRepository<T, ID> {
  modelClass: typeof juggler.PersistedModel;

  constructor( modelClass: typeof juggler.PersistedModel, dataSource: juggler.DataSource) {
    this.modelClass = bindModel(modelClass, dataSource);
  }

  create(entity: ObjectType<T>, options?: Options): Promise<T> {
    return ensurePromise(this.modelClass.create(entity, options));
  }

  createAll(entities: ObjectType<T>[], options?: Options): Promise<T[]> {
    return ensurePromise(this.modelClass.create(entities, options));
  }

  save(entity: ObjectType<T>, options?: Options): Promise<T> {
    const idName = this.modelClass.definition.idName();
    let id;
    if (typeof entity.getId === 'function') {
      id = entity.getId();
    } else {
      id = entity[idName];
    }
    if (id == null) {
      return this.create(entity, options);
    } else {
      return this.replaceById(id, entity, options).
        then(result => result ? entity : null);
    }
  }

  find(filter?: Filter, options?: Options): Promise<T[]> {
    return ensurePromise(this.modelClass.find(filter, options));
  }

  findById(id: ID, filter?: Filter, options?: Options): Promise<T> {
    return ensurePromise(this.modelClass.findById(id, filter, options));
  }

  update(entity: ObjectType<T>, options?: Options): Promise<boolean> {
    return this.updateById(entity.getId(), entity, options);
  }

  delete(entity: ObjectType<T>, options?: Options): Promise<boolean> {
    return this.deleteById(entity.getId(), options);
  }

  updateAll(data: ObjectType<T>, where?: Where, options?: Options): Promise<number> {
    return ensurePromise(this.modelClass.updateAll(where, data, options)).
      then(result => result.count);
  }

  updateById(id: ID, data: ObjectType<T>, options?: Options): Promise<boolean> {
    const idProp = this.modelClass.definition.idName();
    const where = {} as Where;
    where[idProp] = id;
    return this.updateAll(data, where, options).then(count => count > 0);
  }

  replaceById(id: ID, data: ObjectType<T>, options?: Options): Promise<boolean> {
    return ensurePromise(this.modelClass.replaceById(id, data, options)).then(result => !!result);
  }

  deleteAll(where?: Where, options?: Options): Promise<number> {
    return ensurePromise(this.modelClass.deleteAll(where, options)).
      then(result => result.count);
  }

  deleteById(id: ID, options?: Options): Promise<boolean> {
    return ensurePromise(this.modelClass.deleteById(id, options)).
      then(result => result.count > 0);
  }

  count(where?: Where, options?: Options): Promise<number> {
    return ensurePromise(this.modelClass.count(where, options));
  }

  exists(id: ID, options?: Options): Promise<boolean> {
    return ensurePromise(this.modelClass.exists(id, options));
  }
}
